import { NextRequest, NextResponse } from 'next/server';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendOrderConfirmation } from '@/lib/email/order-confirmation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, total, shipping, userId, paymentProvider } = body;

    // Validate
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items must be a non-empty array' }, { status: 400 });
    }
    if (!customer?.email) {
      return NextResponse.json({ error: 'Customer email is required' }, { status: 400 });
    }
    if (!total || total <= 0) {
      return NextResponse.json({ error: 'Total must be greater than 0' }, { status: 400 });
    }

    // 1. Create order
    const orderRepo = new SupabaseOrderRepository();
    const order = await orderRepo.create({
      items,
      customer,
      total,
      shipping: shipping ?? 0,
      userId: userId || undefined,
      paymentProvider: paymentProvider || 'demo',
    });

    // 2. Update status to 'paid'
    const admin = createAdminClient();
    await admin
      .from('orders')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', order.id);

    // 3. If userId: clear cart_items
    if (userId) {
      await admin.from('cart_items').delete().eq('user_id', userId);
    }

    // 4. If userId: increment loyalty points (1 point per euro)
    if (userId) {
      const points = Math.floor(total);
      if (points > 0) {
        await admin.rpc('increment_loyalty_points', {
          p_user_id: userId,
          p_points: points,
        });
      }
    }

    // 5. Send confirmation email (non-blocking)
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
      subtotal: total - (shipping ?? 0),
      shipping: shipping ?? 0,
      total,
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error('[POST /api/checkout]', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
