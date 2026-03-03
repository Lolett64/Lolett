import { createAdminClient } from '@/lib/supabase/admin';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';
import { sendOrderConfirmation } from '@/lib/email/order-confirmation';
import type { Size } from '@/types';

interface FulfillOrderParams {
  items: Array<{
    productId: string;
    productName: string;
    size: Size;
    quantity: number;
    price: number;
  }>;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  total: number;
  shipping: number;
  userId?: string;
  paymentProvider: 'stripe' | 'paypal' | 'demo';
  paymentId: string;
}

export async function fulfillOrder(params: FulfillOrderParams): Promise<string> {
  const { items, customer, total, shipping, userId, paymentProvider, paymentId } = params;
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from('orders')
    .select('id')
    .eq('payment_id', paymentId)
    .maybeSingle();

  if (existing) {
    console.log(`[fulfillOrder] Order already exists for payment ${paymentId}`);
    return existing.id;
  }

  const orderRepo = new SupabaseOrderRepository();
  const order = await orderRepo.create({
    items,
    customer,
    total,
    shipping,
    userId,
    paymentProvider,
  });

  await admin
    .from('orders')
    .update({
      status: 'paid',
      payment_id: paymentId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  if (userId) {
    await admin.from('cart_items').delete().eq('user_id', userId);
  }

  if (userId) {
    const points = Math.floor(total);
    if (points > 0) {
      await admin.rpc('increment_loyalty_points', {
        p_user_id: userId,
        p_points: points,
      });
    }
  }

  sendOrderConfirmation({
    to: customer.email,
    orderNumber: order.orderNumber,
    items: items.map((i) => ({
      productName: i.productName,
      size: i.size,
      quantity: i.quantity,
      price: i.price,
    })),
    customer,
    subtotal: total - shipping,
    shipping,
    total,
  }).catch((err) => console.error('[fulfillOrder] Email error:', err));

  console.log(`[fulfillOrder] Order ${order.orderNumber} created`);
  return order.id;
}
