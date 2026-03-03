import { NextResponse } from 'next/server';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendOrderShipped } from '@/lib/email/order-shipped';
import { sendOrderDelivered } from '@/lib/email/order-delivered';

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
  const body = (await request.json()) as { status?: string; trackingNumber?: string };

  const validStatuses = [
    'pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded', 'expired',
  ];

  if (!body.status || !validStatuses.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const updatePayload: Record<string, string> = {
    status: body.status,
    updated_at: new Date().toISOString(),
  };

  if (body.trackingNumber) {
    updatePayload['tracking_number'] = body.trackingNumber;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send transactional emails on status change (fire-and-forget)
  if (body.status === 'shipped' || body.status === 'delivered') {
    const customer = data.customer as { firstName: string; lastName: string; email: string; address: string; city: string; postalCode: string; country?: string };

    if (customer?.email) {
      if (body.status === 'shipped') {
        // Fetch order items for shipped email
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_name, size, quantity, price')
          .eq('order_id', id);

        sendOrderShipped({
          to: customer.email,
          orderNumber: data.order_number,
          items: (orderItems || []).map((i: { product_name: string; size: string; quantity: number; price: number }) => ({
            productName: i.product_name,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
          })),
          customer,
          subtotal: data.total - data.shipping,
          shipping: data.shipping,
          total: data.total,
          trackingNumber: body.trackingNumber || data.tracking_number,
        }).catch((err: unknown) => console.error('[Admin] Shipped email error:', err));
      }

      if (body.status === 'delivered') {
        sendOrderDelivered({
          to: customer.email,
          orderNumber: data.order_number,
          firstName: customer.firstName,
        }).catch((err: unknown) => console.error('[Admin] Delivered email error:', err));
      }
    }
  }

  return NextResponse.json({ order: data });
}
