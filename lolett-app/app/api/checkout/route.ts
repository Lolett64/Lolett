import { NextRequest, NextResponse } from 'next/server';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendOrderConfirmation } from '@/lib/email/order-confirmation';
import { SHIPPING } from '@/lib/constants';
import type { Size } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, userId, paymentProvider } = body;

    // Validate
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items must be a non-empty array' }, { status: 400 });
    }
    if (!customer?.email) {
      return NextResponse.json({ error: 'Customer email is required' }, { status: 400 });
    }

    // Server-side price verification: fetch real prices from DB
    const admin = createAdminClient();
    const productIds = items.map((i: { productId: string }) => i.productId);
    const { data: dbProducts, error: dbError } = await admin
      .from('products')
      .select('id, price')
      .in('id', productIds);

    if (dbError || !dbProducts) {
      return NextResponse.json({ error: 'Failed to verify prices' }, { status: 500 });
    }

    const priceMap = new Map(dbProducts.map((p: { id: string; price: number }) => [p.id, p.price]));
    const verifiedItems = items.map((item: { productId: string; productName: string; size: Size; quantity: number }) => {
      const realPrice = priceMap.get(item.productId);
      if (realPrice === undefined) {
        throw new Error(`Product ${item.productId} not found`);
      }
      return { ...item, price: realPrice };
    });

    const subtotal = verifiedItems.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0);
    const shipping = subtotal >= SHIPPING.FREE_THRESHOLD ? 0 : SHIPPING.COST;
    const total = subtotal + shipping;

    // 1. Create order
    const orderRepo = new SupabaseOrderRepository();
    const order = await orderRepo.create({
      items: verifiedItems,
      customer,
      total,
      shipping,
      userId: userId || undefined,
      paymentProvider: paymentProvider || 'demo',
    });

    // 2. Update status to 'paid'
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
      items: verifiedItems.map((i: { productName: string; size: string; quantity: number; price: number }) => ({
        productName: i.productName,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
      })),
      customer,
      subtotal,
      shipping,
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
