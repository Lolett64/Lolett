import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { ShippingLabelInfo } from '@/components/admin/ShippingLabelInfo';
import type { PickupPoint, ShippingMethod } from '@/types';

interface OrderItem {
  product_name: string;
  size: string;
  color: string | null;
  quantity: number;
  price: number;
}

interface OrderRow {
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
  shipping_method: ShippingMethod | null;
  pickup_point: PickupPoint | null;
}

// Estimation très simple : 250g par article + 100g d'emballage.
// Lola valide manuellement avant d'imprimer l'étiquette → suffisant comme base.
function estimateWeightGrams(items: OrderItem[]): number {
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
  return Math.max(250, totalQty * 250 + 100);
}

async function getOrder(id: string): Promise<{ order: OrderRow; items: OrderItem[] } | null> {
  const supabase = createAdminClient();
  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).single(),
    supabase.from('order_items').select('product_name, size, color, quantity, price').eq('order_id', id),
  ]);
  if (!order) return null;
  return { order: order as OrderRow, items: (items ?? []) as OrderItem[] };
}

export default async function ShippingLabelInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getOrder(id);
  if (!data) notFound();

  const { order, items } = data;
  const weight = estimateWeightGrams(items);

  return (
    <div className="flex flex-col gap-6 max-w-4xl print:max-w-none">
      <div className="flex items-center gap-3 print:hidden">
        <Link
          href={`/admin/orders/${order.id}`}
          className="font-[family-name:var(--font-montserrat)] flex items-center gap-1.5 text-sm text-[#1a1510]/40 hover:text-[#B89547] transition-colors"
        >
          <ChevronLeft className="size-4" />
          Retour à la commande
        </Link>
      </div>

      <ShippingLabelInfo
        orderNumber={order.order_number}
        customer={order.customer}
        items={items}
        pickupPoint={order.pickup_point}
        shippingMethod={order.shipping_method}
        weightEstimateGrams={weight}
      />
    </div>
  );
}
