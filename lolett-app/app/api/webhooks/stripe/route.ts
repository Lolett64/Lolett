import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // TODO: When Stripe is configured:
  // 1. Verify webhook signature (STRIPE_WEBHOOK_SECRET)
  // 2. Listen for checkout.session.completed
  // 3. Create Order in DB
  // 4. Clear cart
  // 5. Award loyalty points
  // 6. Send confirmation email

  return NextResponse.json({ received: true });
}
