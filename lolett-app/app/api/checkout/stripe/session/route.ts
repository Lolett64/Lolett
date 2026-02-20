import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';
import { sendOrderConfirmation } from '@/lib/email/order-confirmation';

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

    // Order doesn't exist yet — create it inline instead of waiting for webhook
    const metadata = session.metadata;
    if (!metadata?.items || !metadata?.customer) {
      return NextResponse.json({ error: 'Missing session metadata' }, { status: 500 });
    }

    const items = JSON.parse(metadata.items);
    const customer = JSON.parse(metadata.customer);
    const total = parseFloat(metadata.total || '0');
    const shipping = parseFloat(metadata.shipping || '0');
    const userId = metadata.userId || undefined;

    const orderRepo = new SupabaseOrderRepository();
    const order = await orderRepo.create({
      items,
      customer,
      total,
      shipping,
      userId,
      paymentProvider: 'stripe',
    });

    // Mark as paid with payment_id
    await admin
      .from('orders')
      .update({
        status: 'paid',
        payment_id: paymentIntent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    // Clear cart
    if (userId) {
      await admin.from('cart_items').delete().eq('user_id', userId);
    }

    // Loyalty points
    if (userId) {
      const points = Math.floor(total);
      if (points > 0) {
        await admin.rpc('increment_loyalty_points', {
          p_user_id: userId,
          p_points: points,
        });
      }
    }

    // Confirmation email (fire-and-forget)
    sendOrderConfirmation({
      to: customer.email,
      orderNumber: order.orderNumber,
      items: items.map((i: { productName: string; size: string; quantity: number; price: number }) => ({
        productName: i.productName,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
      })),
      customer,
      subtotal: total - shipping,
      shipping,
      total,
    }).catch((err) => console.error('[session] Email error:', err));

    console.log(`[session] Order ${order.orderNumber} created inline`);
    return NextResponse.json({ orderId: order.id, status: 'paid' });
  } catch (error) {
    console.error('[GET /api/checkout/stripe/session]', error);
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
}
