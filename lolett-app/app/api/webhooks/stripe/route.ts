import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import Stripe from 'stripe';
import { z } from 'zod';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendOrderConfirmation } from '@/lib/email/order-confirmation';
import { generateInvoicePdf } from '@/lib/invoice/generate-invoice';
import { decrementStockForOrder } from '@/lib/orders/decrement-stock';
import { sendHtmlEmail } from '@/lib/email-provider';
import { renderGiftCardDeliveryV3 } from '@/lib/email/templates/gift-card-delivery-v3';
import { renderGiftCardPurchaseConfirmationV3 } from '@/lib/email/templates/gift-card-purchase-confirmation-v3';
import { sendOrderRefunded } from '@/lib/email/order-refunded';
import { sendDisputeAlertToAdmin, sendDisputeClosedToAdmin } from '@/lib/email/dispute-alert';
import { SHIPPING_COUNTRIES } from '@/lib/constants';
import type { ShippingMethod, ShippingCountryCode, PickupPoint } from '@/types';
import type { RedeemGiftCardResult } from '@/lib/types/gift-card';

const VALID_COUNTRY_CODES = SHIPPING_COUNTRIES.map((c) => c.code) as ShippingCountryCode[];
const VALID_SHIPPING_METHODS: ShippingMethod[] = ['home', 'mondial_relay'];

const VALID_SIZES = [
  'TU', 'XS', 'S', 'M', 'L', 'XL', 'XXL',
  '29', '30', '31', '32', '33', '34', '35', '36', '37', '38',
  '39', '40', '41', '42', '43', '44',
  'S/M', 'M/L',
] as const;

const WebhookItemSchema = z.array(z.object({
  productId: z.string(),
  productName: z.string(),
  size: z.enum(VALID_SIZES),
  color: z.string().optional(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
}));

const WebhookCustomerSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET || !signature) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 });
    }
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[Stripe webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Idempotency globale event-id : Stripe peut renvoyer le même event si on
  // n'a pas répondu sous 5s ou en cas d'erreur réseau côté Stripe. On utilise
  // INSERT ON CONFLICT pour avoir une garantie atomique au niveau PostgreSQL —
  // si 2 invocations webhook arrivent en parallèle (race condition Vercel
  // serverless), une seule passera, l'autre verra le conflit et skipera.
  {
    const adminCheck = createAdminClient();
    const { error: insertErr } = await adminCheck
      .from('stripe_webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
      });

    if (insertErr) {
      // PostgreSQL error code 23505 = unique_violation (event déjà inséré).
      // Tout autre erreur = problème DB → on retry via Stripe (return 500).
      const errCode = (insertErr as { code?: string }).code;
      if (errCode === '23505') {
        console.log(`[Stripe webhook] Event ${event.id} (${event.type}) already processed (atomic check), skipping`);
        return NextResponse.json({ received: true, idempotent: true });
      }
      console.error('[Stripe webhook] idempotency insert failed:', insertErr);
      return NextResponse.json({ error: 'Idempotency check failed' }, { status: 500 });
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    // --- Gift card purchase branch ---
    if (metadata?.kind === 'gift_card') {
      try {
        const admin = createAdminClient();

        // Idempotence : récupère la carte associée à la session
        const { data: existingGc, error: fetchErr } = await admin
          .from('gift_cards')
          .select('id, code, initial_amount, balance, status, purchaser_email, purchaser_name, recipient_email, recipient_name, message, expires_at, email_sent_at')
          .eq('stripe_session_id', session.id)
          .maybeSingle();

        if (fetchErr) {
          console.error('[Stripe webhook] Gift card lookup error:', fetchErr);
          await markEventProcessed(event);
          return NextResponse.json({ received: true });
        }

        if (!existingGc) {
          console.error(`[Stripe webhook] No gift_card row for session ${session.id}`);
          await markEventProcessed(event);
          return NextResponse.json({ received: true });
        }

        // Skip si déjà traité
        if (existingGc.status === 'active' || existingGc.email_sent_at) {
          console.log(`[Stripe webhook] Gift card ${existingGc.code} already active, skipping`);
          await markEventProcessed(event);
          return NextResponse.json({ received: true });
        }

        const nowIso = new Date().toISOString();

        // Active la carte cadeau
        const { error: updateErr } = await admin
          .from('gift_cards')
          .update({
            status: 'active',
            activated_at: nowIso,
            stripe_payment_intent: session.payment_intent as string,
            email_sent_at: nowIso,
            updated_at: nowIso,
          })
          .eq('id', existingGc.id);

        if (updateErr) {
          console.error('[Stripe webhook] Gift card update error:', updateErr);
          // NE PAS marker — on veut que Stripe retry pour réessayer l'activation
          await unmarkEventProcessed(event);
          return NextResponse.json({ error: 'Gift card update failed' }, { status: 500 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolettshop.com';

        // Email destinataire
        try {
          const deliveryHtml = renderGiftCardDeliveryV3({
            recipientName: existingGc.recipient_name || undefined,
            purchaserName: existingGc.purchaser_name || undefined,
            amount: Number(existingGc.initial_amount),
            code: existingGc.code,
            message: existingGc.message || undefined,
            expiresAt: existingGc.expires_at,
            shopUrl: baseUrl,
          });
          const deliveryRes = await sendHtmlEmail({
            to: existingGc.recipient_email,
            subject: `${existingGc.purchaser_name ? `${existingGc.purchaser_name} vous offre` : 'Une carte cadeau'} une carte cadeau LOLETT`,
            html: deliveryHtml,
          });
          if (!deliveryRes.success) {
            console.error('[Stripe webhook] Gift card delivery email failed:', deliveryRes.error);
          }
        } catch (e) {
          console.error('[Stripe webhook] Gift card delivery email exception:', e);
        }

        // Email acheteur
        try {
          const purchaseHtml = renderGiftCardPurchaseConfirmationV3({
            purchaserName: existingGc.purchaser_name || undefined,
            recipientEmail: existingGc.recipient_email,
            recipientName: existingGc.recipient_name || undefined,
            amount: Number(existingGc.initial_amount),
            code: existingGc.code,
          });
          const purchaseRes = await sendHtmlEmail({
            to: existingGc.purchaser_email,
            subject: 'Votre achat de carte cadeau LOLETT',
            html: purchaseHtml,
          });
          if (!purchaseRes.success) {
            console.error('[Stripe webhook] Gift card purchase email failed:', purchaseRes.error);
          }
        } catch (e) {
          console.error('[Stripe webhook] Gift card purchase email exception:', e);
        }

        console.log(`[Stripe webhook] Gift card ${existingGc.code} activated`);
      } catch (error) {
        console.error('[Stripe webhook] Gift card processing error:', error);
        // Erreur non gérée : unmark + 500 pour Stripe retry
        await unmarkEventProcessed(event);
        return NextResponse.json({ error: 'Gift card processing failed' }, { status: 500 });
      }
      await markEventProcessed(event);
      return NextResponse.json({ received: true });
    }

    if (!metadata?.items || !metadata?.customer) {
      console.error('[Stripe webhook] Missing metadata');
      await markEventProcessed(event);
      return NextResponse.json({ received: true });
    }

    try {
      const items = WebhookItemSchema.parse(JSON.parse(metadata.items));
      const customer = WebhookCustomerSchema.parse(JSON.parse(metadata.customer));
      const grossTotal = parseFloat(metadata.total || '0');
      const shipping = parseFloat(metadata.shipping || '0');
      const userId = metadata.userId || undefined;

      const promoCode = metadata.promoCode || undefined;
      const promoDiscount = parseFloat(metadata.promoDiscount || '0') || 0;
      const giftCardCode = metadata.giftCardCode || undefined;
      const giftCardAmount = parseFloat(metadata.giftCardRedeemAmount || '0') || 0;

      // Livraison — récupérée depuis la metadata stockée à la création de session.
      const rawMethod = metadata.shippingMethod as ShippingMethod | undefined;
      const rawCountry = metadata.shippingCountry as ShippingCountryCode | undefined;
      const shippingMethod: ShippingMethod = rawMethod && VALID_SHIPPING_METHODS.includes(rawMethod) ? rawMethod : 'home';
      const shippingCountry: ShippingCountryCode = rawCountry && VALID_COUNTRY_CODES.includes(rawCountry) ? rawCountry : 'FR';
      const shippingCarrier = shippingMethod === 'mondial_relay' ? 'mondial_relay' : 'colissimo';
      let pickupPoint: PickupPoint | null = null;
      if (metadata.pickupPoint) {
        try {
          pickupPoint = JSON.parse(metadata.pickupPoint) as PickupPoint;
        } catch {
          pickupPoint = null;
        }
      }

      const finalTotal = Math.max(0, +(grossTotal - promoDiscount - giftCardAmount).toFixed(2));

      const admin = createAdminClient();

      // Idempotency: skip if order already created (e.g. inline by /session endpoint)
      const { data: existingOrder } = await admin
        .from('orders')
        .select('id')
        .eq('payment_id', session.payment_intent as string)
        .maybeSingle();

      if (existingOrder) {
        console.log(`[Stripe webhook] Order already exists for payment ${session.payment_intent}, skipping`);
        await markEventProcessed(event);
        return NextResponse.json({ received: true });
      }

      // Vérifie aussi les autres early returns dans cette branche (lignes ~210, 215)
      // qui retournent {received:true} sans markEventProcessed

      // 1. Create order
      const orderRepo = new SupabaseOrderRepository();
      const order = await orderRepo.create({
        items,
        customer,
        total: finalTotal,
        shipping,
        promoCode,
        promoDiscount,
        giftCardCode,
        giftCardAmount,
        shippingMethod,
        shippingCarrier,
        shippingCountry,
        pickupPoint,
        userId,
        paymentProvider: 'stripe',
      });

      // 1.5 Atomic gift card redemption (BEFORE marking paid).
      // Si le débit échoue, l'order reste en 'pending' puis bascule en
      // 'payment_review' → Lola traite manuellement (refund Stripe partiel
      // ou contact client). Évite de marquer 'paid' + envoyer l'email de
      // confirmation alors que la carte n'a pas été débitée (Lola perdrait
      // le montant gift card encaissé par Stripe sans contrepartie en DB).
      if (metadata.giftCardCode && metadata.giftCardRedeemAmount) {
        const code = String(metadata.giftCardCode).trim().toUpperCase();
        const amount = parseFloat(String(metadata.giftCardRedeemAmount));

        if (code && Number.isFinite(amount) && amount > 0) {
          const { data: card, error: cardErr } = await admin
            .from('gift_cards')
            .select('id')
            .eq('code', code)
            .maybeSingle();

          if (cardErr || !card) {
            console.error('[Stripe webhook] gift_card lookup error:', cardErr);
            await admin.from('orders').update({
              status: 'payment_review',
              updated_at: new Date().toISOString(),
            }).eq('id', order.id);
            Sentry.captureMessage(
              `Gift card lookup failed for paid order ${order.orderNumber}`,
              { level: 'error', extra: { orderId: order.id, code, amount, error: cardErr } },
            );
            await markEventProcessed(event);
            return NextResponse.json({ received: true, warning: 'gift_card_lookup_failed' });
          }

          const { data: redeemRaw, error: redeemError } = await admin.rpc(
            'redeem_gift_card_atomic',
            {
              p_card_id: card.id,
              p_order_id: order.id,
              p_amount: amount,
              p_stripe_payment_intent: session.payment_intent as string,
            },
          );
          const redeemResult = redeemRaw as RedeemGiftCardResult | null;

          if (redeemError || !redeemResult || redeemResult.success === false) {
            console.error('[Stripe webhook] redeem_gift_card_atomic failed:', { redeemError, redeemResult });
            await admin.from('orders').update({
              status: 'payment_review',
              updated_at: new Date().toISOString(),
            }).eq('id', order.id);
            Sentry.captureMessage(
              `Gift card redeem failed for paid order ${order.orderNumber}`,
              {
                level: 'error',
                extra: {
                  orderId: order.id,
                  code,
                  amount,
                  reason: redeemResult?.success === false ? redeemResult.reason : 'rpc_error',
                  rpcError: redeemError?.message,
                },
              },
            );
            // Stripe a déjà encaissé. On return 200 pour qu'il ne re-tente pas
            // (le retry échouerait pareil — l'idempotency check renverrait success).
            // L'order est en 'payment_review' → traitement humain.
            await markEventProcessed(event);
            return NextResponse.json({ received: true, warning: 'gift_card_redeem_failed' });
          }
        }
      }

      // 2. Mark as paid
      await admin
        .from('orders')
        .update({
          status: 'paid',
          payment_id: session.payment_intent as string,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      // 2.5 Decrement stock atomically
      await decrementStockForOrder(order.id);

      // 3. Clear cart
      if (userId) {
        await admin.from('cart_items').delete().eq('user_id', userId);
      }

      // 4. Loyalty points (based on amount actually paid)
      if (userId) {
        const points = Math.floor(finalTotal);
        if (points > 0) {
          await admin.rpc('increment_loyalty_points', {
            p_user_id: userId,
            p_points: points,
          });
        }
      }

      // 4.5 Génération facture PDF (await — on veut joindre le PDF à l'email).
      // En cas d'échec, on log et on envoie l'email sans PJ pour ne pas bloquer
      // la confirmation (le PDF pourra être régénéré manuellement plus tard).
      let invoicePdf: { buffer: Buffer; filename: string } | undefined;
      try {
        const invoice = await generateInvoicePdf({
          ...order,
          shippingMethod,
          shippingCarrier,
          shippingCountry,
          pickupPoint,
          promoCode,
          promoDiscount,
          giftCardCode,
          giftCardAmount,
        });
        if (invoice.pdf) {
          invoicePdf = { buffer: invoice.pdf, filename: `Facture-${invoice.number}.pdf` };
        }
      } catch (err) {
        console.error('[Stripe webhook] Invoice generation failed:', err);
      }

      // 5. Confirmation email
      await sendOrderConfirmation({
        to: customer.email,
        orderNumber: order.orderNumber,
        items: items.map((i: { productName: string; size: string; quantity: number; price: number }) => ({
          productName: i.productName,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
        })),
        customer,
        subtotal: grossTotal - shipping,
        shipping,
        total: finalTotal,
        promoCode,
        promoDiscount,
        giftCardCode,
        giftCardAmount,
        shippingMethod,
        pickupPoint,
        invoicePdf,
      });

      // 7. Increment promo_codes.used_count if a promo was applied
      try {
        if (metadata.promoId) {
          const promoId = String(metadata.promoId);
          const { data: promo, error: promoErr } = await admin
            .from('promo_codes')
            .select('id, used_count')
            .eq('id', promoId)
            .maybeSingle();

          if (promoErr) {
            console.error('[Stripe webhook] promo lookup error:', promoErr);
          } else if (promo) {
            const { error: updErr } = await admin
              .from('promo_codes')
              .update({
                used_count: Number(promo.used_count ?? 0) + 1,
                updated_at: new Date().toISOString(),
              })
              .eq('id', promo.id);
            if (updErr) console.error('[Stripe webhook] promo used_count update error:', updErr);
          }
        }
      } catch (promoErr) {
        // Never fail the webhook because of a promo increment issue.
        console.error('[Stripe webhook] promo increment error:', promoErr);
      }

      console.log(`[Stripe webhook] Order ${order.orderNumber} created successfully`);
    } catch (error) {
      console.error('[Stripe webhook] Error processing order:', error);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }

    await markEventProcessed(event);
    return NextResponse.json({ received: true });
  }

  // ─────────────────────────────────────────────────────────────
  // charge.refunded — synchronise DB après refund (admin OU dashboard Stripe)
  // ─────────────────────────────────────────────────────────────
  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id;

    if (!paymentIntentId) {
      console.error('[Stripe webhook] charge.refunded without payment_intent', { chargeId: charge.id });
      await markEventProcessed(event);
      return NextResponse.json({ received: true });
    }

    const admin = createAdminClient();
    const { data: order, error: orderErr } = await admin
      .from('orders')
      .select('id, order_number, total, refund_amount, status, customer, user_id')
      .eq('payment_id', paymentIntentId)
      .maybeSingle();

    if (orderErr || !order) {
      console.warn(`[Stripe webhook] No order for refunded payment_intent ${paymentIntentId}`, orderErr);
      await markEventProcessed(event);
      return NextResponse.json({ received: true });
    }

    const refundedTotalCents = charge.amount_refunded;
    const refundedTotalEuros = +(refundedTotalCents / 100).toFixed(2);
    const orderTotalCents = Math.round(Number(order.total) * 100);
    const isFullyRefunded = refundedTotalCents >= orderTotalCents;
    const newStatus = isFullyRefunded ? 'refunded' : 'partially_refunded';

    const previouslyRefundedEuros = Number(order.refund_amount ?? 0);
    const deltaEuros = +(refundedTotalEuros - previouslyRefundedEuros).toFixed(2);

    // Idempotency niveau état : si déjà au bon montant + statut, skip silencieusement
    if (
      order.status === newStatus
      && Math.abs(previouslyRefundedEuros - refundedTotalEuros) < 0.005
    ) {
      console.log(`[Stripe webhook] Order ${order.order_number} refund already in sync (${refundedTotalEuros}€)`);
      await markEventProcessed(event);
      return NextResponse.json({ received: true });
    }

    // GUARD CRITICAL : Stripe ne garantit PAS l'ordre des webhooks.
    // Si on reçoit un event "older" (charge.amount_refunded < ce qu'on a en DB),
    // on NE doit PAS overwrite le refund_amount avec une valeur stale.
    // Scenario : 2 refunds 30€ rapides → webhook B (60€) arrive avant webhook A (30€).
    // Webhook B sync correctement (delta=60). Webhook A arrive ensuite avec amount_refunded=30
    // (état au moment de SON refund) → deltaEuros négatif → overwrite 60→30 sans guard.
    if (deltaEuros <= 0) {
      console.log(`[Stripe webhook] Order ${order.order_number} refund event stale (delta=${deltaEuros}€, already at ${previouslyRefundedEuros}€), skipping`);
      await markEventProcessed(event);
      return NextResponse.json({ received: true, stale: true });
    }

    // Récup la raison depuis la metadata du dernier refund (passée par notre admin endpoint)
    const lastRefund = charge.refunds?.data?.[0];
    const refundReason =
      (lastRefund?.metadata?.admin_reason as string | undefined)
      || 'Remboursement traité via Stripe';

    // 1. Update order
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      refund_amount: refundedTotalEuros,
      refunded_at: new Date().toISOString(),
      refund_reason: refundReason,
      updated_at: new Date().toISOString(),
    };

    const { error: updErr } = await admin
      .from('orders')
      .update(updatePayload)
      .eq('id', order.id);

    if (updErr) {
      console.error('[Stripe webhook] order update on refund failed:', updErr);
      Sentry.captureException(updErr, {
        extra: { orderId: order.id, refundedTotalEuros },
      });
      // Unmark idempotency pour que Stripe retry — la 1re tentative n'a rien fait.
      await unmarkEventProcessed(event);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    // 2. Stock — restock prorata du DELTA refund (pas du total déjà refundé)
    // Évite de re-restock sur un refund partiel suivi d'un autre.
    const orderTotalEuros = Number(order.total);
    const deltaRatio = orderTotalEuros > 0 ? deltaEuros / orderTotalEuros : 0;

    if (deltaRatio > 0) {
      try {
        await admin.rpc('increment_stock_for_order_partial', {
          p_order_id: order.id,
          p_ratio: Math.min(1, deltaRatio),
        });
      } catch (e) {
        console.error('[Stripe webhook] increment_stock_for_order_partial failed:', e);
        Sentry.captureException(e, { extra: { orderId: order.id, deltaRatio } });
      }
    }

    // 3. Loyalty points — retire les points prorata du delta
    if (order.user_id && deltaRatio > 0) {
      const pointsToRemove = Math.floor(orderTotalEuros * deltaRatio);
      if (pointsToRemove > 0) {
        try {
          await admin.rpc('decrement_loyalty_points', {
            p_user_id: order.user_id,
            p_points: pointsToRemove,
          });
        } catch (e) {
          console.error('[Stripe webhook] decrement_loyalty_points failed:', e);
          Sentry.captureException(e, { extra: { orderId: order.id, pointsToRemove } });
        }
      }
    }

    // 4. Email confirmation client (best-effort — un échec n'invalide pas le refund)
    const customer = order.customer as { email?: string; firstName?: string } | null;
    if (customer?.email) {
      try {
        await sendOrderRefunded({
          to: customer.email,
          orderNumber: order.order_number,
          firstName: customer.firstName ?? '',
          amount: refundedTotalEuros,
          reason: refundReason,
        });
      } catch (e) {
        console.error('[Stripe webhook] refund email failed:', e);
        // Sentry pour observabilité — Lola peut renvoyer manuellement depuis admin
        Sentry.captureException(e, {
          level: 'warning',
          extra: {
            orderId: order.id,
            orderNumber: order.order_number,
            kind: 'refund_email_failure',
          },
        });
      }
    }

    console.log(`[Stripe webhook] Order ${order.order_number} refunded ${refundedTotalEuros}€ (status: ${newStatus})`);
    await markEventProcessed(event);
    return NextResponse.json({ received: true });
  }

  // ─────────────────────────────────────────────────────────────
  // charge.dispute.created — alerte URGENT à Lola + marque commande
  // ─────────────────────────────────────────────────────────────
  if (event.type === 'charge.dispute.created') {
    const dispute = event.data.object as Stripe.Dispute;
    const paymentIntentId = typeof dispute.payment_intent === 'string'
      ? dispute.payment_intent
      : dispute.payment_intent?.id;

    if (!paymentIntentId) {
      console.error('[Stripe webhook] dispute.created without payment_intent', { disputeId: dispute.id });
      await markEventProcessed(event);
      return NextResponse.json({ received: true });
    }

    const admin = createAdminClient();
    const { data: order } = await admin
      .from('orders')
      .select('id, order_number, customer, total')
      .eq('payment_id', paymentIntentId)
      .maybeSingle();

    if (!order) {
      console.warn(`[Stripe webhook] No order for disputed payment_intent ${paymentIntentId}`);
      await markEventProcessed(event);
      return NextResponse.json({ received: true });
    }

    // 1. Update order — passe en 'disputed', stocke metadata litige.
    // CRITIQUE : on AWAIT et on check l'erreur. Si l'UPDATE échoue, on unmark
    // event_id + return 500 → Stripe retry. Évite le scénario "Lola reçoit
    // l'email URGENT mais voit la commande encore en 'paid' dans l'admin".
    const { error: disputeUpdErr } = await admin
      .from('orders')
      .update({
        status: 'disputed',
        disputed_at: new Date().toISOString(),
        dispute_id: dispute.id,
        dispute_status: dispute.status,
        dispute_reason: dispute.reason,
        dispute_amount: +(dispute.amount / 100).toFixed(2),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (disputeUpdErr) {
      console.error('[Stripe webhook] dispute.created order UPDATE failed:', disputeUpdErr);
      Sentry.captureException(disputeUpdErr, {
        level: 'error',
        extra: { orderId: order.id, disputeId: dispute.id, kind: 'dispute_db_update_failure' },
      });
      await unmarkEventProcessed(event);
      return NextResponse.json({ error: 'Dispute order update failed' }, { status: 500 });
    }

    // 2. Email URGENT Lola
    const customer = order.customer as {
      firstName?: string;
      lastName?: string;
      email?: string;
    } | null;

    const customerName = customer
      ? `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() || 'Client'
      : 'Client';

    const stripeUrl = `https://dashboard.stripe.com/disputes/${dispute.id}`;
    const dueBy = dispute.evidence_details?.due_by
      ? new Date(dispute.evidence_details.due_by * 1000).toLocaleDateString('fr-FR', {
          day: '2-digit', month: 'long', year: 'numeric',
        })
      : 'À vérifier sur Stripe';

    // Sentry trace (avant l'email — garantit que Lola sera alertée même si email fail)
    Sentry.captureMessage(`Dispute opened on order ${order.order_number}`, {
      level: 'warning',
      extra: {
        orderId: order.id,
        disputeId: dispute.id,
        amount: dispute.amount / 100,
        reason: dispute.reason,
      },
    });

    // Email URGENT Lola — si fail, unmark + 500 pour retry Stripe
    // (l'order est déjà marqué 'disputed' en DB donc l'état est sauf,
    // mais on veut absolument que Lola soit alertée)
    try {
      const emailRes = await sendDisputeAlertToAdmin({
        orderNumber: order.order_number,
        customerName,
        customerEmail: customer?.email ?? 'inconnu',
        amount: +(dispute.amount / 100).toFixed(2),
        reason: dispute.reason,
        stripeUrl,
        dueBy,
      });
      if (!emailRes.success) {
        throw new Error(emailRes.error ?? 'Email send failed');
      }
    } catch (e) {
      console.error('[Stripe webhook] dispute alert email failed — will retry via Stripe:', e);
      Sentry.captureException(e, {
        level: 'error',
        extra: { orderId: order.id, disputeId: dispute.id, kind: 'dispute_alert_email_failure' },
      });
      await unmarkEventProcessed(event);
      return NextResponse.json({ error: 'Dispute alert email failed' }, { status: 500 });
    }

    console.log(`[Stripe webhook] Dispute ${dispute.id} opened on order ${order.order_number}`);
    await markEventProcessed(event);
    return NextResponse.json({ received: true });
  }

  // ─────────────────────────────────────────────────────────────
  // charge.dispute.closed — résultat litige (won/lost/warning_closed)
  // ─────────────────────────────────────────────────────────────
  if (event.type === 'charge.dispute.closed') {
    const dispute = event.data.object as Stripe.Dispute;
    const admin = createAdminClient();

    const { data: order } = await admin
      .from('orders')
      .select('id, order_number')
      .eq('dispute_id', dispute.id)
      .maybeSingle();

    if (!order) {
      console.warn(`[Stripe webhook] No order for closed dispute ${dispute.id}`);
      await markEventProcessed(event);
      return NextResponse.json({ received: true });
    }

    // Update dispute_status sur la commande
    const updatePayload: Record<string, unknown> = {
      dispute_status: dispute.status,
      updated_at: new Date().toISOString(),
    };

    // Si gagné, on remet la commande en 'paid' (les fonds sont reversés par Stripe)
    if (dispute.status === 'won') {
      updatePayload.status = 'paid';
    }

    await admin
      .from('orders')
      .update(updatePayload)
      .eq('id', order.id);

    // Email Lola — résultat
    try {
      await sendDisputeClosedToAdmin({
        orderNumber: order.order_number,
        result: dispute.status,
        amount: +(dispute.amount / 100).toFixed(2),
        stripeUrl: `https://dashboard.stripe.com/disputes/${dispute.id}`,
      });
    } catch (e) {
      console.error('[Stripe webhook] dispute closed email failed:', e);
    }

    console.log(`[Stripe webhook] Dispute ${dispute.id} closed (${dispute.status}) for order ${order.order_number}`);
    await markEventProcessed(event);
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}

// Helper : enrichit l'event marqué (insert s'est fait en début de fonction
// avec event_id+type seulement) avec le payload pour debug/audit. No-op si
// l'event a été supprimé entre-temps. Idempotent (UPDATE WHERE).
async function markEventProcessed(event: Stripe.Event) {
  try {
    const admin = createAdminClient();
    await admin
      .from('stripe_webhook_events')
      .update({
        payload: event.data.object as unknown as Record<string, unknown>,
      })
      .eq('event_id', event.id);
  } catch (e) {
    console.warn('[Stripe webhook] markEventProcessed update (payload enrich) failed:', e);
  }
}

// Helper : supprime le marker idempotency pour permettre à Stripe de retry
// si le handler a échoué de manière transitoire (DB error, email fail critical).
async function unmarkEventProcessed(event: Stripe.Event) {
  try {
    const admin = createAdminClient();
    await admin
      .from('stripe_webhook_events')
      .delete()
      .eq('event_id', event.id);
  } catch (e) {
    console.warn('[Stripe webhook] unmarkEventProcessed failed:', e);
  }
}
