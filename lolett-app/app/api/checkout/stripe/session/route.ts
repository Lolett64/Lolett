import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { fulfillOrder } from '@/lib/checkout/fulfill-order';
import { VALID_SHIPPING_METHODS } from '@/lib/constants';
import type { ShippingMethod, ShippingCarrier, ShippingCountryCode, PickupPoint } from '@/types';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

// GET /api/checkout/stripe/session?session_id=cs_xxx
// Returns the orderId associated with a Stripe checkout session.
// Creates the order inline if the webhook hasn't fired yet (avoids polling delay).
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 402 });
    }

    const paymentIntent = session.payment_intent as string;
    const admin = createAdminClient();

    // Check if order already exists (created by webhook)
    const { data: existingOrder } = await admin
      .from('orders')
      .select('id')
      .eq('payment_id', paymentIntent)
      .maybeSingle();

    if (existingOrder) {
      return NextResponse.json({ orderId: existingOrder.id, status: 'paid' });
    }

    // Order doesn't exist yet — create it via fulfillOrder helper
    const metadata = session.metadata;
    if (!metadata?.items || !metadata?.customer) {
      return NextResponse.json({ error: 'Missing session metadata' }, { status: 500 });
    }

    const items = JSON.parse(metadata.items);
    const customer = JSON.parse(metadata.customer);
    const total = parseFloat(metadata.total || '0');
    const shipping = parseFloat(metadata.shipping || '0');
    const userId = metadata.userId || undefined;

    // Livraison / Click & Collect — mêmes clés metadata que le webhook, pour que
    // le chemin inline (page succès avant webhook) ne perde NI le mode NI le point
    // de retrait, et applique la même garde C&C (payment_review si point invalide).
    const rawMethod = metadata.shippingMethod as ShippingMethod | undefined;
    const shippingMethod: ShippingMethod =
      rawMethod && VALID_SHIPPING_METHODS.includes(rawMethod) ? rawMethod : 'home';
    const shippingCountry = (metadata.shippingCountry as ShippingCountryCode) || 'FR';
    const shippingCarrier: ShippingCarrier =
      shippingMethod === 'mondial_relay' ? 'mondial_relay'
      : shippingMethod === 'click_collect' ? 'click_collect'
      : 'colissimo';
    let pickupPoint: PickupPoint | null = null;
    if (metadata.pickupPoint) {
      try { pickupPoint = JSON.parse(metadata.pickupPoint) as PickupPoint; } catch { pickupPoint = null; }
    }

    const orderId = await fulfillOrder({
      items,
      customer,
      total,
      shipping,
      userId,
      paymentProvider: 'stripe',
      paymentId: paymentIntent,
      shippingMethod,
      shippingCarrier,
      shippingCountry,
      pickupPoint,
      pickupPointId: metadata.pickup_point_id || undefined,
      pickupProvider: metadata.pickup_provider || undefined,
    });

    return NextResponse.json({ orderId, status: 'paid' });
  } catch (error) {
    console.error('[GET /api/checkout/stripe/session]', error);
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
}
