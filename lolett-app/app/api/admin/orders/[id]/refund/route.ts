import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAlreadyRefundedQtyMap, refundItemKey } from '@/lib/orders/refund-tracking';

// Refund par articles (Scénario B) — 2 modes :
// - 'items' : Lola coche les articles retournés. Montant calculé serveur depuis
//   order_items DB (jamais depuis le client → empêche un attacker de claim un
//   prix falsifié). Restock pile-poil le bon variant via restock_order_items_partial.
// - 'commercial_gesture' : montant libre. Pas de restock (aucun produit retourné).

const RefundItemSchema = z.object({
  productId: z.string().uuid(),
  size: z.string().min(1).max(40),
  color: z.string().max(60).nullable().optional(),
  quantity: z.number().int().positive().max(100),
});

const RefundSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('items'),
    items: z.array(RefundItemSchema).min(1).max(50),
    reason: z.string().min(3).max(500),
    nonce: z.string().min(8).max(64),
  }),
  z.object({
    kind: z.literal('commercial_gesture'),
    amount: z.number().positive().max(100000),
    reason: z.string().min(3).max(500),
    nonce: z.string().min(8).max(64),
  }),
]);

const REFUNDABLE_STATUSES = ['paid', 'confirmed', 'shipped', 'delivered', 'partially_refunded'] as const;

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

// Normalise une couleur pour matching insensible à la casse / accents légers.
function normalizeColor(c: string | null | undefined): string {
  return (c ?? '').trim().toLowerCase();
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: orderId } = await params;

  const raw = await request.json().catch(() => null);
  const parsed = RefundSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const admin = createAdminClient();

  const { data: order, error: fetchError } = await admin
    .from('orders')
    .select('id, payment_id, payment_provider, total, status, refund_amount')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  if (order.payment_provider !== 'stripe') {
    return NextResponse.json(
      { error: `Provider non supporté : ${order.payment_provider}` },
      { status: 400 },
    );
  }

  if (!order.payment_id) {
    return NextResponse.json({ error: 'Aucun paiement à rembourser' }, { status: 400 });
  }

  if (!REFUNDABLE_STATUSES.includes(order.status as typeof REFUNDABLE_STATUSES[number])) {
    return NextResponse.json(
      { error: `Impossible de rembourser une commande en statut "${order.status}"` },
      { status: 400 },
    );
  }

  const orderTotal = Number(order.total);
  const alreadyRefunded = Number(order.refund_amount ?? 0);
  const remaining = +(orderTotal - alreadyRefunded).toFixed(2);

  // Calcul du montant à rembourser selon le mode choisi.
  let amount: number;
  let itemsForMetadata: Array<{ p: string; s: string; c: string; q: number }> | null = null;

  if (data.kind === 'items') {
    // Recalcul SERVER-SIDE depuis order_items (jamais depuis le payload client).
    // Évite qu'un attacker falsifie le prix pour rembourser plus que la vente réelle.
    const { data: orderItems, error: itemsErr } = await admin
      .from('order_items')
      .select('product_id, size, color, quantity, price')
      .eq('order_id', orderId);

    if (itemsErr || !orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { error: 'Articles de la commande introuvables' },
        { status: 404 },
      );
    }

    let computedAmount = 0;
    const matchedForMetadata: Array<{ p: string; s: string; c: string; q: number }> = [];

    // Defence-in-depth : agrège les qty déjà remboursées via les refunds Stripe précédents
    // (parsing metadata.items_json). Empêche de re-rembourser un item déjà remboursé même
    // si le client (UI) envoie une requête falsifiée ou une UI obsolète.
    const alreadyRefundedQtyMap = await getAlreadyRefundedQtyMap(getStripe(), order.payment_id);

    for (const refundItem of data.items) {
      const reqColor = normalizeColor(refundItem.color);
      const match = orderItems.find(oi =>
        oi.product_id === refundItem.productId
        && oi.size.trim().toLowerCase() === refundItem.size.trim().toLowerCase()
        && normalizeColor(oi.color) === reqColor,
      );

      if (!match) {
        return NextResponse.json(
          { error: `Article introuvable dans la commande : ${refundItem.productId} (${refundItem.size}${refundItem.color ? ` / ${refundItem.color}` : ''})` },
          { status: 400 },
        );
      }

      const alreadyQty = alreadyRefundedQtyMap.get(
        refundItemKey(refundItem.productId, refundItem.size, refundItem.color ?? null),
      ) ?? 0;
      const remainingQty = match.quantity - alreadyQty;

      if (refundItem.quantity > remainingQty) {
        return NextResponse.json(
          { error: `Quantité demandée (${refundItem.quantity}) supérieure au reste remboursable (${remainingQty}/${match.quantity}, déjà remboursé ${alreadyQty}) pour ${refundItem.size}` },
          { status: 400 },
        );
      }

      computedAmount += Number(match.price) * refundItem.quantity;
      matchedForMetadata.push({
        p: refundItem.productId,
        s: refundItem.size,
        c: refundItem.color ?? '',
        q: refundItem.quantity,
      });
    }

    amount = +computedAmount.toFixed(2);
    itemsForMetadata = matchedForMetadata;

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Montant calculé nul — aucun article à rembourser' },
        { status: 400 },
      );
    }
  } else {
    // commercial_gesture : montant libre saisi par Lola.
    amount = data.amount;
  }

  if (amount > remaining + 0.005) {
    return NextResponse.json(
      { error: `Montant supérieur au reste remboursable (${remaining.toFixed(2)} €)` },
      { status: 400 },
    );
  }

  // Idempotency-key Stripe : nonce client unique par submit (évite collision si
  // Lola enchaîne 2 refunds avant sync DB du 1er webhook).
  const idempotencyKey = `refund_${orderId}_${data.nonce}`;

  // Stripe metadata limite : 50 keys, 500 BYTES UTF-8 par value. items_json
  // compressé (clés courtes p/s/c/q) → ~30 items max. admin_reason peut contenir
  // des accents (2 bytes/char) → on tronque à 490 bytes pour être safe.
  const reasonBytes = Buffer.byteLength(data.reason, 'utf8');
  const safeReason = reasonBytes > 490
    ? `${data.reason.slice(0, 200)}…`
    : data.reason;

  const metadata: Record<string, string> = {
    order_id: orderId,
    admin_reason: safeReason,
    refund_kind: data.kind,
  };
  if (itemsForMetadata) {
    const itemsJson = JSON.stringify(itemsForMetadata);
    if (Buffer.byteLength(itemsJson, 'utf8') > 490) {
      return NextResponse.json(
        { error: 'Trop d\'articles dans le refund (limite Stripe metadata atteinte). Faire en plusieurs refunds.' },
        { status: 400 },
      );
    }
    metadata.items_json = itemsJson;
  }

  // Verrou applicatif anti-double-refund : UPDATE atomique conditionnel sur
  // refund_amount = previousRefundAmount. Réservation préemptive avant l'appel
  // Stripe pour empêcher 2 onglets concurrents de dépasser le total remboursable.
  // Si une autre requête a déjà modifié refund_amount entre le SELECT et ici,
  // l'UPDATE ne touchera 0 ligne → on retourne 409.
  // Note : refund_amount peut être NULL en DB (commandes pré-Niveau 2 sans default 0).
  // Postgres .eq(col, null) ne match pas (sémantique SQL "= NULL" ≠ "IS NULL"), donc
  // on bascule sur .is('refund_amount', null) si la valeur précédente est null.
  const previousRefundAmount = order.refund_amount;
  const newRefundAmount = +(alreadyRefunded + amount).toFixed(2);

  const reservationQuery = admin
    .from('orders')
    .update({ refund_amount: newRefundAmount })
    .eq('id', orderId);
  const reservation = await (
    previousRefundAmount === null || previousRefundAmount === undefined
      ? reservationQuery.is('refund_amount', null)
      : reservationQuery.eq('refund_amount', previousRefundAmount as number)
  ).select('id');

  if (reservation.error || !reservation.data || reservation.data.length === 0) {
    return NextResponse.json(
      { error: 'Un remboursement vient d\'être lancé, réessaie dans 3 secondes.' },
      { status: 409 },
    );
  }

  try {
    const refund = await getStripe().refunds.create(
      {
        payment_intent: order.payment_id,
        amount: Math.round(amount * 100),
        reason: 'requested_by_customer',
        metadata,
      },
      { idempotencyKey },
    );

    // refund_amount déjà mis à jour côté admin (réservation préemptive). Le webhook
    // charge.refunded qui sync ensuite verra que refundedTotalEuros matche déjà
    // refund_amount DB (idempotence via diff < 0.005) et skippera le re-update.
    return NextResponse.json({
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      kind: data.kind,
      message: 'Remboursement initié — la commande sera mise à jour dans quelques secondes.',
    });
  } catch (err) {
    // ROLLBACK de la réservation préemptive : Stripe a échoué donc on rend la
    // capacité de refund à Lola. Sans ce rollback, refund_amount serait gonflé
    // alors qu'aucun remboursement réel n'a eu lieu.
    // Note : restaure la valeur précédente exacte (peut être null pour les commandes
    // pré-Niveau 2). On utilise .eq('refund_amount', newRefundAmount) car la
    // réservation a posé une valeur numérique (pas null).
    const rollback = await admin
      .from('orders')
      .update({ refund_amount: previousRefundAmount })
      .eq('id', orderId)
      .eq('refund_amount', newRefundAmount);
    if (rollback.error) {
      console.error('[admin refund] CRITICAL rollback failed:', rollback.error);
    }
    const message = err instanceof Error ? err.message : 'Stripe refund failed';
    console.error('[admin refund] Stripe error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
