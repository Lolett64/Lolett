'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getUserOrders } from '@/lib/adapters/supabase-user';
import type { Order } from '@/types';
import { cn, formatPrice } from '@/lib/utils';

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmee', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Payee', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Expediee', color: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Livree', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulee', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Remboursee', color: 'bg-gray-100 text-gray-700' },
  expired: { label: 'Expiree', color: 'bg-gray-100 text-gray-500' },
};

export function OrderList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserOrders(user.id).then((o) => {
      setOrders(o);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-[#f3efe8] rounded w-48 mb-6" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#FEFAF3] rounded-xl border border-[#c4b49c]/15 p-6 animate-pulse">
            <div className="h-4 bg-[#f3efe8] rounded w-32 mb-3" />
            <div className="h-3 bg-[#f3efe8] rounded w-48" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-playfair text-xl text-[#1a1510] mb-6">Mes commandes</h1>

      {orders.length === 0 ? (
        <div className="bg-[#FEFAF3] rounded-xl border border-[#c4b49c]/15 shadow-sm p-12 text-center">
          <ShoppingBag className="h-12 w-12 text-[#c4b49c]/40 mx-auto mb-4" />
          <h3 className="font-playfair text-lg text-[#1a1510] mb-2">Aucune commande</h3>
          <p className="text-sm text-[#8a7d6b] font-body mb-6">Vous n&apos;avez pas encore passe de commande.</p>
          <Link
            href="/shop/femme"
            className="inline-block px-6 py-3 rounded-lg bg-[#1B0B94] hover:bg-[#B89547] text-white font-semibold font-body text-sm transition-colors"
          >
            Decouvrir la boutique
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusLabels[order.status] || statusLabels.pending;
            return (
              <Link
                key={order.id}
                href={`/compte/commandes/${order.id}`}
                className="block bg-[#FEFAF3] rounded-xl border border-[#c4b49c]/15 shadow-sm p-5 hover:border-[#1B0B94]/30 transition-colors"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-[#1B0B94]" />
                    <div>
                      <p className="text-sm font-semibold text-[#1a1510] font-body">
                        Commande #{order.orderNumber}
                      </p>
                      <p className="text-xs text-[#8a7d6b] font-body">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', status.color)}>
                      {status.label}
                    </span>
                    <span className="text-sm font-semibold text-[#1a1510] font-body">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
