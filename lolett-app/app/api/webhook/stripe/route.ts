import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { fulfillOrder } from '@/lib/checkout/fulfill-order';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== 'paid') {
      console.log('[webhook] Session not paid yet, skipping');
      return NextResponse.json({ received: true });
    }

    const metadata = session.metadata;
    if (!metadata?.items || !metadata?.customer) {
      console.error('[webhook] Missing metadata on session', session.id);
      return NextResponse.json({ received: true });
    }

    try {
      const paymentIntent = session.payment_intent as string;
      await fulfillOrder({
        items: JSON.parse(metadata.items),
        customer: JSON.parse(metadata.customer),
        total: parseFloat(metadata.total || '0'),
        shipping: parseFloat(metadata.shipping || '0'),
        userId: metadata.userId || undefined,
        paymentProvider: 'stripe',
        paymentId: paymentIntent,
      });
    } catch (err) {
      console.error('[webhook] Failed to fulfill order:', err);
      return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
