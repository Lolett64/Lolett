import { Suspense } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { OrderFilters } from '@/components/admin/OrderFilters';
import { OrdersTable } from '@/components/admin/OrdersTable';

interface SearchParams {
  status?: string;
  sort?: string;
  order?: string;
}

interface OrderRow {
  id: string;
  order_number: string;
  customer: { firstName: string; lastName: string; email: string };
  total: number;
  shipping: number;
  status: string;
  payment_provider: string;
  created_at: string;
}

async function getOrders(params: SearchParams): Promise<OrderRow[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from('orders')
    .select('id, order_number, customer, total, shipping, status, payment_provider, created_at');

  if (params.status) query = query.eq('status', params.status);

  const validSortFields = ['created_at', 'total', 'status'];
  const sortField = validSortFields.includes(params.sort ?? '') ? params.sort! : 'created_at';
  query = query.order(sortField, { ascending: params.order === 'asc' });

  const { data } = await query;
  return (data ?? []) as OrderRow[];
}

async function OrdersContent({ searchParams }: { searchParams: SearchParams }) {
  const orders = await getOrders(searchParams);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-[family-name:var(--font-newsreader)] text-3xl font-light text-[#1a1510]">Commandes</h2>
        <p className="text-sm text-[#B89547]/70 mt-1">{orders.length} commande(s)</p>
      </div>

      <OrderFilters />

      <OrdersTable orders={orders} />
    </div>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<div className="h-48 rounded-xl bg-[#B89547]/10 animate-pulse" />}>
      <OrdersContent searchParams={params} />
    </Suspense>
  );
}
