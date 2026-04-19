import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendOrderConfirmation } from '@/lib/email/order-confirmation';
import { SHIPPING } from '@/lib/constants';
import type { Size } from '@/types';

const CheckoutItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(1).max(200),
  size: z.string().min(1).max(10),
  color: z.string().max(50).optional(),
  quantity: z.number().int().min(1).max(20),
  price: z.number().min(0).optional(), // will be overridden server-side
});

const CustomerSchema = z.object({
  firstName: z.string().min(1).max(100).transform(v => v.trim()),
  lastName: z.string().min(1).max(100).transform(v => v.trim()),
  email: z.string().email().max(254),
  phone: z.string().max(20).default(''),
  address: z.string().min(1).max(300).transform(v => v.trim()),
  city: z.string().min(1).max(100).transform(v => v.trim()),
  postalCode: z.string().min(1).max(10).transform(v => v.trim()),
  country: z.string().min(1).max(100).default('France'),
});

const CheckoutSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1).max(50),
  customer: CustomerSchema,
  userId: z.string().uuid().optional(),
  paymentProvider: z.enum(['demo', 'stripe']).default('demo'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { items, customer, userId, paymentProvider } = parsed.data;

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
    const verifiedItems = items.map((item) => {
      const realPrice = priceMap.get(item.productId);
      if (realPrice === undefined) {
        throw new Error(`Product ${item.productId} not found`);
      }
      return { ...item, size: item.size as Size, price: realPrice };
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
