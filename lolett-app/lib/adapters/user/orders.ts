import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/types';

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    items: (o.order_items ?? []).map((item: { product_id: string; product_name: string; size: string; quantity: number; price: number; color?: string }) => ({
      productId: item.product_id,
      productName: item.product_name,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
      color: item.color,
    })),
    customer: o.customer ?? {},
    total: o.total,
    shipping: o.shipping,
    status: o.status,
    paymentProvider: o.payment_provider,
    paymentId: o.payment_id,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  }));
}

export async function getOrderById(orderId: string, userId: string): Promise<Order | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    orderNumber: data.order_number,
    items: (data.order_items ?? []).map((item: { product_id: string; product_name: string; size: string; quantity: number; price: number; color?: string }) => ({
      productId: item.product_id,
      productName: item.product_name,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
      color: item.color,
    })),
    customer: data.customer ?? {},
    total: data.total,
    shipping: data.shipping,
    status: data.status,
    paymentProvider: data.payment_provider,
    paymentId: data.payment_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
