import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const RefundSchema = z.object({
  amount: z.number().positive().max(100000),
  reason: z.string().min(3).max(500),
  // Nonce généré côté client pour Stripe idempotency-key. Évite les collisions
  // si Lola lance 2 refunds partiels successifs du même montant avant que le
  // webhook 1er ait sync refund_amount en DB.
  nonce: z.string().min(8).max(64),
});

const REFUNDABLE_STATUSES = ['paid', 'confirmed', 'shipped', 'delivered', 'partially_refunded'] as const;

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
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

  const { amount, reason, nonce } = parsed.data;
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

  if (amount > remaining + 0.005) {
    return NextResponse.json(
      { error: `Montant supérieur au reste remboursable (${remaining.toFixed(2)} €)` },
      { status: 400 },
    );
  }

  // Idempotency-key Stripe : nonce client unique par submit (évite collision
  // si Lola enchaîne 2 refunds 30€ avant sync DB du 1er webhook).
  // Le double-clic UI est lui géré par le state submitting du dialog.
  const idempotencyKey = `refund_${orderId}_${nonce}`;

  try {
    const refund = await getStripe().refunds.create(
      {
        payment_intent: order.payment_id,
        amount: Math.round(amount * 100),
        reason: 'requested_by_customer',
        metadata: {
          order_id: orderId,
          admin_reason: reason,
        },
      },
      { idempotencyKey },
    );

    // PAS de mise à jour DB ici — le webhook charge.refunded fait le travail
    // (idempotent via stripe_webhook_events.event_id). Garantit la cohérence
    // que Lola passe par l'admin OU par le dashboard Stripe directement.
    return NextResponse.json({
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      message: 'Remboursement initié — la commande sera mise à jour dans quelques secondes.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe refund failed';
    console.error('[admin refund] Stripe error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
