import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { OrderStatusUpdate } from '@/components/admin/OrderStatusUpdate';
import { formatPrice, formatDate } from '@/lib/admin/utils';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  size: string;
  quantity: number;
  price: number;
}

interface OrderDetail {
  id: string;
  order_number: string;
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
  status: string;
  payment_provider: string;
  payment_id: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

async function getOrder(id: string): Promise<OrderDetail | null> {
  const supabase = createAdminClient();
  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).single(),
    supabase.from('order_items').select('*').eq('order_id', id),
  ]);
  if (!order) return null;
  return { ...order, items: items ?? [] } as OrderDetail;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  const subtotal = order.total - order.shipping;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/orders"
          className="flex items-center gap-1 text-sm text-lolett-gray-500 hover:text-lolett-gray-900"
        >
          <ChevronLeft className="size-4" />
          Commandes
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-lolett-gray-900">{order.order_number}</h2>
          <p className="text-sm text-lolett-gray-500 mt-1">
            Créée le {formatDate(order.created_at)}
            {order.updated_at !== order.created_at &&
              ` · Mise à jour le ${formatDate(order.updated_at)}`}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p className="font-medium text-lolett-gray-900">
              {order.customer.firstName} {order.customer.lastName}
            </p>
            <p className="text-lolett-gray-600">{order.customer.email}</p>
            {order.customer.phone && (
              <p className="text-lolett-gray-600">{order.customer.phone}</p>
            )}
          </CardContent>
        </Card>

        {/* Shipping address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Adresse de livraison</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm text-lolett-gray-600">
            <p>{order.customer.address}</p>
            <p>
              {order.customer.postalCode} {order.customer.city}
            </p>
            <p>{order.customer.country}</p>
          </CardContent>
        </Card>
      </div>

      {/* Order items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Articles</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-0">
          {order.items.map((item, idx) => (
            <div key={item.id}>
              {idx > 0 && <Separator className="my-3" />}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-lolett-gray-900">{item.product_name}</p>
                  <p className="text-xs text-lolett-gray-500">
                    Taille : {item.size} · Quantité : {item.quantity}
                  </p>
                </div>
                <div className="text-sm font-medium">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            </div>
          ))}

          <Separator className="my-4" />
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-sm text-lolett-gray-600">
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-lolett-gray-600">
              <span>Livraison</span>
              <span>{order.shipping === 0 ? 'Gratuite' : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lolett-gray-900 mt-1">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paiement</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm text-lolett-gray-600">
          <div className="flex justify-between">
            <span>Fournisseur</span>
            <span className="capitalize font-medium">{order.payment_provider ?? '—'}</span>
          </div>
          {order.payment_id && (
            <div className="flex justify-between">
              <span>ID transaction</span>
              <span className="font-mono text-xs">{order.payment_id}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status update */}
      <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
    </div>
  );
}
