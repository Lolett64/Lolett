'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Search } from 'lucide-react';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { formatPrice, formatDate } from '@/lib/admin/utils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

type DateRange = 'all' | 'today' | '7days' | '30days';

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('all');

  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filter by customer name/email
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((order) => {
        const firstName = (order.customer?.firstName ?? '').toLowerCase();
        const lastName = (order.customer?.lastName ?? '').toLowerCase();
        const email = (order.customer?.email ?? '').toLowerCase();
        const fullName = `${firstName} ${lastName}`;
        return (
          firstName.includes(q) ||
          lastName.includes(q) ||
          fullName.includes(q) ||
          email.includes(q)
        );
      });
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      let cutoff: Date;
      switch (dateRange) {
        case 'today':
          cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case '7days':
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
      result = result.filter(
        (order) => new Date(order.created_at) >= cutoff
      );
    }

    return result;
  }, [orders, searchQuery, dateRange]);

  return (
    <>
      {/* Search & date filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#1a1510]/30 pointer-events-none" />
          <Input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-md border-gray-200/50 bg-white text-sm text-[#1a1510] placeholder:text-[#1a1510]/30 focus-visible:border-[#B89547]/50 focus-visible:ring-[#B89547]/20"
          />
        </div>

        <Select
          value={dateRange}
          onValueChange={(v) => setDateRange(v as DateRange)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="today">Aujourd&apos;hui</SelectItem>
            <SelectItem value="7days">7 derniers jours</SelectItem>
            <SelectItem value="30days">30 derniers jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {(searchQuery.trim() || dateRange !== 'all') && (
        <p className="text-xs text-[#B89547]/60 -mt-3">
          {filteredOrders.length} résultat(s) sur {orders.length} commande(s)
        </p>
      )}

      {/* Orders table */}
      {filteredOrders.length === 0 ? (
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
                {filteredOrders.map((order) => (
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
    </>
  );
}
