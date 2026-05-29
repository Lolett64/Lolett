import { NextResponse, after } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendOrderShipped } from '@/lib/email/order-shipped';
import { sendOrderDelivered } from '@/lib/email/order-delivered';
import { sendOrderCancelled } from '@/lib/email/order-cancelled';
import { sendOrderReadyForPickupEmail } from '@/lib/email/order-ready-for-pickup';
import { assignPickupCodeAtomic } from '@/lib/orders/pickup-code';
import {
  ORDER_STATUS_VALUES,
  ORDER_STATUS_TRANSITIONS,
  STRIPE_MANAGED_STATUSES,
} from '@/lib/constants';
import type { OrderStatus, PickupPoint, ShippingMethod, ShippingCarrier } from '@/types';

// Statuts manuellement éditables = tous SAUF ceux gérés par Stripe (refunded /
// partially_refunded / disputed / payment_review). payment_review reste accessible
// EN SORTIE via ORDER_STATUS_TRANSITIONS (payment_review → paid|cancelled) mais
// n'est pas une CIBLE manuelle ; le guard STRIPE_MANAGED_STATUSES ci-dessous le bloque
// comme cible, ce qui est le comportement voulu (Stripe pose payment_review, pas l'admin).
const MANUAL_STATUS_VALUES = ORDER_STATUS_VALUES.filter(
  (s) => !STRIPE_MANAGED_STATUSES.includes(s),
) as [OrderStatus, ...OrderStatus[]];

const PatchSchema = z.object({
  status: z.enum(MANUAL_STATUS_VALUES).optional(),
  trackingNumber: z.string().max(50).optional(),
  adminNotes: z.string().max(2000).nullable().optional(),
  cancelReason: z.string().max(500).optional(),
  // Pas de refundAmount/refundReason ici — le refund passe par
  // POST /api/admin/orders/:id/refund qui appelle Stripe.
});

type OrderCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country?: string;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: order, error: orderError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase.from('orders').select('*').eq('id', id).single(),
      supabase.from('order_items').select('*').eq('order_id', id),
    ]);

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 404 });
  }

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({ order: { ...order, items: items ?? [] } });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const raw = await request.json().catch(() => null);
  const parsed = PatchSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const body = parsed.data;

  // Fetch current order to detect status transitions
  const { data: currentOrder, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !currentOrder) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  // Defence-in-depth : Zod a déjà retiré 'refunded'/'partially_refunded'/'disputed'
  // de la liste autorisée, mais on ajoute un guard runtime au cas où la liste
  // évoluerait par mégarde — empêche absolument toute transition manuelle
  // vers ces statuts gérés par Stripe.
  const STRIPE_MANAGED_STATUSES_SET = new Set(['refunded', 'partially_refunded', 'disputed']);
  if (body.status && STRIPE_MANAGED_STATUSES_SET.has(body.status)) {
    return NextResponse.json(
      {
        error: 'Statut géré automatiquement par Stripe. Pour rembourser, utilisez "Rembourser via Stripe". Pour les litiges, ils sont créés automatiquement par Stripe.',
      },
      { status: 400 },
    );
  }

  // Validation de transition via la table centralisée (PR2). On n'autorise
  // que les cibles déclarées dans ORDER_STATUS_TRANSITIONS pour le statut courant.
  const currentStatus = currentOrder.status as OrderStatus;
  const statusChanging = !!body.status && body.status !== currentStatus;
  if (statusChanging) {
    const allowed = ORDER_STATUS_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(body.status as OrderStatus)) {
      return NextResponse.json(
        { error: `Transition non autorisée : "${currentStatus}" → "${body.status}".` },
        { status: 400 },
      );
    }
  }

  // ── Branche Click & Collect : ready_for_pickup ──────────────────────────
  // Génération atomique du code de retrait + email transactionnel. On sort
  // tôt de la fonction (chemin dédié) pour ne pas mélanger avec l'update générique.
  if (body.status === 'ready_for_pickup' && currentStatus !== 'ready_for_pickup') {
    const pickupPoint = currentOrder.pickup_point as PickupPoint | null;
    if (
      currentOrder.shipping_method !== 'click_collect'
      || !pickupPoint
      || pickupPoint.provider !== 'click_collect'
    ) {
      return NextResponse.json(
        { error: 'Cette commande n\'a pas de point Click & Collect valide.' },
        { status: 400 },
      );
    }

    const result = await assignPickupCodeAtomic(supabase, id, {
      status: 'ready_for_pickup',
      ready_for_pickup_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (!result) {
      Sentry.captureMessage('pickup_code generation failed after 8 attempts', {
        level: 'error',
        tags: { feature: 'click_and_collect', step: 'generate_code' },
        extra: { orderId: id },
      });
      return NextResponse.json(
        { error: 'Impossible de générer un code de retrait unique. Réessayez.' },
        { status: 500 },
      );
    }

    // result.updated est typé `unknown` (signature PR3). On le projette sur la
    // forme attendue. OrderCustomer est déjà défini dans ce fichier.
    const updatedOrder = result.updated as {
      order_number: string;
      customer: OrderCustomer | null;
      pickup_point: PickupPoint | null;
    };

    if (updatedOrder.customer?.email) {
      const customer = updatedOrder.customer;
      after(async () => {
        try {
          // Décision D1 : on passe pickupPoint: updatedOrder.pickup_point
          // SANS cast ni narrowing — la signature PR3 accepte PickupPoint | null
          // (le guard provider !== 'click_collect' est interne au sender).
          await sendOrderReadyForPickupEmail({
            to: customer.email,
            firstName: customer.firstName,
            orderNumber: updatedOrder.order_number,
            pickupCode: result.code,
            pickupPoint: updatedOrder.pickup_point,
          });
        } catch (err) {
          Sentry.captureException(err, {
            tags: { feature: 'click_and_collect', step: 'email' },
            extra: { orderId: id },
          });
        }
      });
    }

    return NextResponse.json({ order: result.updated });
  }

  const now = new Date().toISOString();
  const updatePayload: Record<string, unknown> = { updated_at: now };

  if (body.status) updatePayload.status = body.status;
  if (body.trackingNumber !== undefined) updatePayload.tracking_number = body.trackingNumber;
  if (body.adminNotes !== undefined) updatePayload.admin_notes = body.adminNotes;
  if (body.cancelReason !== undefined) updatePayload.cancel_reason = body.cancelReason;

  // Auto-set lifecycle timestamps on status transitions
  // Note : refunded_at est set par le webhook charge.refunded, pas ici.
  if (body.status && body.status !== currentOrder.status) {
    if (body.status === 'shipped' && !currentOrder.shipped_at) {
      updatePayload.shipped_at = now;
    }
    if (body.status === 'delivered' && !currentOrder.delivered_at) {
      updatePayload.delivered_at = now;
    }
    if (body.status === 'cancelled' && !currentOrder.cancelled_at) {
      updatePayload.cancelled_at = now;
    }
    if (body.status === 'picked_up' && !currentOrder.picked_up_at) {
      updatePayload.picked_up_at = now;
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Send transactional emails on status change (fire-and-forget)
  const statusChanged = body.status && body.status !== currentOrder.status;
  const customer = updated.customer as OrderCustomer | null;

  if (statusChanged && customer?.email) {
    const orderNumber = updated.order_number as string;

    if (body.status === 'shipped') {
      // §9.4 — Garde-fou : la transition confirmed → shipped est déjà bloquée par
      // ORDER_STATUS_TRANSITIONS pour les commandes C&C (confirmed → ready_for_pickup),
      // mais on n'envoie JAMAIS l'email "Expédiée" si jamais une commande C&C
      // arrivait ici (3 emails au lieu de 2 = bruit, cf. spec §9.4).
      // updated.shipping_method est issu d'un .select().single() non typé → unknown.
      if ((updated.shipping_method as ShippingMethod | null) === 'click_collect') {
        console.warn('[admin/orders] illegal transition: shipped on click_collect order', { orderId: id });
      } else {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_name, size, quantity, price')
          .eq('order_id', id);

        // after() : envoi post-réponse pour ne pas bloquer l'admin, mais garde
        // la lambda vivante (sinon Vercel suspend la fonction et le fetch Brevo
        // est tué → "fetch failed").
        after(async () => {
          try {
            await sendOrderShipped({
              to: customer.email,
              orderNumber,
              items: (orderItems ?? []).map((i: { product_name: string; size: string; quantity: number; price: number }) => ({
                productName: i.product_name,
                size: i.size,
                quantity: i.quantity,
                price: i.price,
              })),
              customer,
              subtotal: Number(updated.total) - Number(updated.shipping) + Number(updated.promo_discount ?? 0) + Number(updated.gift_card_amount ?? 0),
              shipping: Number(updated.shipping),
              total: Number(updated.total),
              trackingNumber: body.trackingNumber || (updated.tracking_number as string | undefined),
              shippingMethod: (updated.shipping_method as ShippingMethod | null) ?? undefined,
              shippingCarrier: (updated.shipping_carrier as ShippingCarrier | null) ?? undefined,
              pickupPoint: (updated.pickup_point as PickupPoint | null) ?? null,
            });
          } catch (err) {
            console.error('[Admin orders PATCH] Shipped email error:', err);
          }
        });
      }
    }

    if (body.status === 'delivered') {
      after(async () => {
        try {
          await sendOrderDelivered({
            to: customer.email,
            orderNumber,
            firstName: customer.firstName,
          });
        } catch (err) {
          console.error('[Admin orders PATCH] Delivered email error:', err);
        }
      });
    }

    if (body.status === 'cancelled') {
      const wasPaid = ['paid', 'confirmed', 'shipped', 'delivered', 'ready_for_pickup'].includes(currentOrder.status);
      after(async () => {
        try {
          await sendOrderCancelled({
            to: customer.email,
            orderNumber,
            firstName: customer.firstName,
            reason: body.cancelReason,
            wasPaid,
          });
        } catch (err) {
          console.error('[Admin orders PATCH] Cancelled email error:', err);
        }
      });
    }

    // Note : pas de branche 'refunded' ici — l'email de remboursement est
    // envoyé par le webhook charge.refunded (cf. app/api/webhooks/stripe/route.ts).
  }

  return NextResponse.json({ order: updated });
}
