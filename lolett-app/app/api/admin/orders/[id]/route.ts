import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendOrderShipped } from '@/lib/email/order-shipped';
import { sendOrderDelivered } from '@/lib/email/order-delivered';
import { sendOrderCancelled } from '@/lib/email/order-cancelled';
import { sendOrderRefunded } from '@/lib/email/order-refunded';

const ORDER_STATUSES = [
  'pending', 'paid', 'confirmed', 'shipped', 'delivered',
  'cancelled', 'refunded', 'expired',
] as const;

const PatchSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  trackingNumber: z.string().max(50).optional(),
  adminNotes: z.string().max(2000).nullable().optional(),
  refundAmount: z.number().positive().optional(),
  refundReason: z.string().max(500).optional(),
  cancelReason: z.string().max(500).optional(),
});

type OrderCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country?: string;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: order, error: orderError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase.from('orders').select('*').eq('id', id).single(),
      supabase.from('order_items').select('*').eq('order_id', id),
    ]);

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 404 });
  }

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({ order: { ...order, items: items ?? [] } });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const raw = await request.json().catch(() => null);
  const parsed = PatchSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const body = parsed.data;

  // Fetch current order to detect status transitions
  const { data: currentOrder, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !currentOrder) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  const now = new Date().toISOString();
  const updatePayload: Record<string, unknown> = { updated_at: now };

  if (body.status) updatePayload.status = body.status;
  if (body.trackingNumber !== undefined) updatePayload.tracking_number = body.trackingNumber;
  if (body.adminNotes !== undefined) updatePayload.admin_notes = body.adminNotes;
  if (body.refundAmount !== undefined) updatePayload.refund_amount = body.refundAmount;
  if (body.refundReason !== undefined) updatePayload.refund_reason = body.refundReason;
  if (body.cancelReason !== undefined) updatePayload.cancel_reason = body.cancelReason;

  // Auto-set lifecycle timestamps on status transitions
  if (body.status && body.status !== currentOrder.status) {
    if (body.status === 'shipped' && !currentOrder.shipped_at) {
      updatePayload.shipped_at = now;
    }
    if (body.status === 'delivered' && !currentOrder.delivered_at) {
      updatePayload.delivered_at = now;
    }
    if (body.status === 'cancelled' && !currentOrder.cancelled_at) {
      updatePayload.cancelled_at = now;
    }
    if (body.status === 'refunded' && !currentOrder.refunded_at) {
      updatePayload.refunded_at = now;
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Send transactional emails on status change (fire-and-forget)
  const statusChanged = body.status && body.status !== currentOrder.status;
  const customer = updated.customer as OrderCustomer | null;

  if (statusChanged && customer?.email) {
    const orderNumber = updated.order_number as string;

    if (body.status === 'shipped') {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_name, size, quantity, price')
        .eq('order_id', id);

      sendOrderShipped({
        to: customer.email,
        orderNumber,
        items: (orderItems ?? []).map((i: { product_name: string; size: string; quantity: number; price: number }) => ({
          productName: i.product_name,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
        })),
        customer,
        subtotal: Number(updated.total) - Number(updated.shipping),
        shipping: Number(updated.shipping),
        total: Number(updated.total),
        trackingNumber: body.trackingNumber || (updated.tracking_number as string | undefined),
        shippingMethod: (updated.shipping_method as 'home' | 'mondial_relay' | null) ?? undefined,
        shippingCarrier: (updated.shipping_carrier as 'colissimo' | 'mondial_relay' | null) ?? undefined,
        pickupPoint: (updated.pickup_point as import('@/types').PickupPoint | null) ?? null,
      }).catch((err: unknown) => console.error('[Admin orders PATCH] Shipped email error:', err));
    }

    if (body.status === 'delivered') {
      sendOrderDelivered({
        to: customer.email,
        orderNumber,
        firstName: customer.firstName,
      }).catch((err: unknown) => console.error('[Admin orders PATCH] Delivered email error:', err));
    }

    if (body.status === 'cancelled') {
      const wasPaid = ['paid', 'confirmed', 'shipped', 'delivered'].includes(currentOrder.status);
      sendOrderCancelled({
        to: customer.email,
        orderNumber,
        firstName: customer.firstName,
        reason: body.cancelReason,
        wasPaid,
      }).catch((err: unknown) => console.error('[Admin orders PATCH] Cancelled email error:', err));
    }

    if (body.status === 'refunded') {
      const amount = body.refundAmount ?? Number(updated.refund_amount) ?? Number(updated.total);
      sendOrderRefunded({
        to: customer.email,
        orderNumber,
        firstName: customer.firstName,
        amount,
        reason: body.refundReason,
      }).catch((err: unknown) => console.error('[Admin orders PATCH] Refunded email error:', err));
    }
  }

  return NextResponse.json({ order: updated });
}
