import { Suspense } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { OrderFilters } from '@/components/admin/OrderFilters';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { OrdersPagination } from '@/components/admin/OrdersPagination';

interface SearchParams {
  status?: string;
  shipping_method?: string;
  sort?: string;
  order?: string;
  page?: string;
  limit?: string;
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

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

async function getOrders(params: SearchParams): Promise<{ orders: OrderRow[]; total: number; page: number; limit: number; totalPages: number }> {
  const supabase = createAdminClient();

  const pageRaw = Number(params.page ?? '1');
  const limitRaw = Number(params.limit ?? String(DEFAULT_LIMIT));
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const limit = Number.isFinite(limitRaw) && limitRaw > 0
    ? Math.min(Math.floor(limitRaw), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('orders')
    .select(
      'id, order_number, customer, total, shipping, status, payment_provider, created_at',
      { count: 'exact' },
    );

  if (params.status) query = query.eq('status', params.status);
  if (params.shipping_method) query = query.eq('shipping_method', params.shipping_method);

  const validSortFields = ['created_at', 'total', 'status'];
  const sortField = validSortFields.includes(params.sort ?? '') ? params.sort! : 'created_at';
  query = query
    .order(sortField, { ascending: params.order === 'asc' })
    .range(from, to);

  const { data, count } = await query;
  const total = count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  return {
    orders: (data ?? []) as OrderRow[],
    total,
    page,
    limit,
    totalPages,
  };
}

async function OrdersContent({ searchParams }: { searchParams: SearchParams }) {
  const { orders, total, page, limit, totalPages } = await getOrders(searchParams);
  const showingFrom = total === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-[family-name:var(--font-newsreader)] text-3xl font-light text-[#1a1510]">Commandes</h2>
        <p className="text-sm text-[#B89547]/70 mt-1">
          {total === 0 ? 'Aucune commande' : `${showingFrom}–${showingTo} sur ${total} commande${total > 1 ? 's' : ''}`}
        </p>
      </div>

      <OrderFilters />

      <OrdersTable orders={orders} />

      {totalPages > 1 && (
        <OrdersPagination page={page} totalPages={totalPages} />
      )}
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
