import { createAdminClient } from '@/lib/supabase/admin';
import type { OrderRepository } from './types';
import type { Order, CustomerInfo, Size } from '@/types';
import type { DbOrder } from './supabase-types';
import { mapOrder, generateOrderNumber } from './supabase-mappers';

export class SupabaseOrderRepository implements OrderRepository {
  async create(orderData: {
    items: {
      productId: string;
      size: Size;
      quantity: number;
      price: number;
      productName: string;
    }[];
    customer: CustomerInfo;
    total: number;
    shipping: number;
    userId?: string;
    paymentProvider?: 'stripe' | 'paypal' | 'demo';
  }): Promise<Order> {
    const admin = createAdminClient();
    const orderNumber = generateOrderNumber();

    const { data: orderRow, error: orderError } = await admin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer: orderData.customer,
        total: orderData.total,
        shipping: orderData.shipping,
        status: 'pending',
        user_id: orderData.userId || null,
        payment_provider: orderData.paymentProvider || 'demo',
      })
      .select('*')
      .single();

    if (orderError || !orderRow) {
      throw new Error(
        `[SupabaseOrderRepository.create] Failed to insert order: ${orderError?.message ?? 'no data'}`
      );
    }

    const orderItems = orderData.items.map((item) => ({
      order_id: orderRow.id as string,
      product_id: item.productId,
      product_name: item.productName,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await admin.from('order_items').insert(orderItems);

    if (itemsError) {
      throw new Error(
        `[SupabaseOrderRepository.create] Failed to insert order items: ${itemsError.message}`
      );
    }

    return {
      id: orderRow.id as string,
      orderNumber,
      items: orderData.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      })),
      customer: orderData.customer,
      total: orderData.total,
      shipping: orderData.shipping,
      status: 'pending',
      createdAt: orderRow.created_at as string,
      updatedAt: orderRow.updated_at as string,
    };
  }

  async findById(id: string): Promise<Order | null> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.error('[SupabaseOrderRepository.findById]', error.message);
      return null;
    }
    return data ? mapOrder(data as DbOrder) : null;
  }

  async findByEmail(email: string): Promise<Order[]> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer->>email', email)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[SupabaseOrderRepository.findByEmail]', error.message);
      return [];
    }
    return (data as DbOrder[]).map(mapOrder);
  }
}

export const orderRepository = new SupabaseOrderRepository();
