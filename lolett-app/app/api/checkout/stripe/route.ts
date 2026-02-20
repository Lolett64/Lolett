import { NextRequest, NextResponse } from 'next/server';
import { PAYMENT_CONFIG } from '@/lib/payment/config';

export async function POST(req: NextRequest) {
  if (!PAYMENT_CONFIG.isStripeEnabled) {
    return NextResponse.json(
      { error: 'Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans .env.local' },
      { status: 503 }
    );
  }

  // TODO: When Stripe keys are configured:
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const session = await stripe.checkout.sessions.create({ ... });
  // return NextResponse.json({ url: session.url });

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
