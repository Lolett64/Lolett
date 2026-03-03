import { Suspense } from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { OrderFilters } from '@/components/admin/OrderFilters';
import { formatPrice, formatDate } from '@/lib/admin/utils';
import { ChevronRight } from 'lucide-react';

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

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#B89547]/30 p-12 text-center">
          <p className="text-[#B89547]/60">Aucune commande trouvée</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200/50 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200/50 bg-[#FDF5E6]">
                <tr>
                  <th className="text-left px-4 py-3 font-[family-name:var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-wider text-[#1a1510]/50">Commande</th>
                  <th className="text-left px-4 py-3 font-[family-name:var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-wider text-[#1a1510]/50 hidden md:table-cell">Client</th>
                  <th className="text-left px-4 py-3 font-[family-name:var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-wider text-[#1a1510]/50 hidden lg:table-cell">Date</th>
                  <th className="text-center px-4 py-3 font-[family-name:var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-wider text-[#1a1510]/50">Statut</th>
                  <th className="text-right px-4 py-3 font-[family-name:var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-wider text-[#1a1510]/50 hidden sm:table-cell">Paiement</th>
                  <th className="text-right px-4 py-3 font-[family-name:var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-wider text-[#1a1510]/50">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FDF5E6] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-[family-name:var(--font-montserrat)] font-medium text-[#1a1510]">{order.order_number}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-[#1a1510]/70">
                        {order.customer?.firstName} {order.customer?.lastName}
                      </div>
                      <div className="text-xs text-[#1a1510]/40">{order.customer?.email}</div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-[#1a1510]/50 text-xs">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell text-[#1a1510]/50 capitalize text-xs">
                      {order.payment_provider ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#1a1510]">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center text-[#1a1510]/30 hover:text-[#B89547] transition-colors"
                      >
                        <ChevronRight className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
