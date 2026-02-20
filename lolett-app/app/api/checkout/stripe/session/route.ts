import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// GET /api/checkout/stripe/session?session_id=cs_xxx
// Returns the orderId associated with a Stripe checkout session
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 402 });
    }

    // Find order by payment_id
    const admin = createAdminClient();
    const { data: order } = await admin
      .from('orders')
      .select('id')
      .eq('payment_id', session.payment_intent as string)
      .maybeSingle();

    if (order) {
      return NextResponse.json({ orderId: order.id, status: 'paid' });
    }

    // Order might not be created yet (webhook pending) — return session info
    return NextResponse.json({
      orderId: null,
      status: 'processing',
      customerEmail: session.customer_email,
    });
  } catch (error) {
    console.error('[GET /api/checkout/stripe/session]', error);
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
}
