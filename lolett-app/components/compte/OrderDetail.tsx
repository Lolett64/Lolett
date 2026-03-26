'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getOrderById } from '@/lib/adapters/supabase-user';
import type { Order } from '@/types';
import { cn, formatPrice } from '@/lib/utils';

const statusSteps = ['pending', 'confirmed', 'paid', 'shipped', 'delivered'];
const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmee',
  paid: 'Payee',
  shipped: 'Expediee',
  delivered: 'Livree',
  cancelled: 'Annulee',
  refunded: 'Remboursee',
  expired: 'Expiree',
};

export function OrderDetail({ orderId }: { orderId: string }) {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getOrderById(orderId, user.id).then((o) => {
      setOrder(o);
      setLoading(false);
    });
  }, [user, orderId]);

  if (loading) {
    return (
      <div className="bg-[#FEFAF3] rounded-xl border border-[#c4b49c]/15 p-8 animate-pulse">
        <div className="h-6 bg-[#f3efe8] rounded w-48 mb-6" />
        <div className="space-y-4">
          <div className="h-4 bg-[#f3efe8] rounded w-64" />
          <div className="h-4 bg-[#f3efe8] rounded w-40" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#FEFAF3] rounded-xl border border-[#c4b49c]/15 shadow-sm p-12 text-center">
        <p className="text-[#5a4d3e] font-body">Commande introuvable.</p>
        <Link href="/compte/commandes" className="text-[#1B0B94] hover:text-[#b3933d] text-sm font-body mt-3 inline-block">
          Retour aux commandes
        </Link>
      </div>
    );
  }

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div>
      <Link href="/compte/commandes" className="inline-flex items-center gap-1 text-sm text-[#1B0B94] hover:text-[#b3933d] font-body mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Retour aux commandes
      </Link>

      <div className="bg-[#FEFAF3] rounded-xl border border-[#c4b49c]/15 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Package className="h-5 w-5 text-[#1B0B94]" />
          <h1 className="font-playfair text-xl text-[#1a1510]">Commande #{order.orderNumber}</h1>
        </div>

        {/* Status timeline */}
        {!['cancelled', 'refunded', 'expired'].includes(order.status) && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className={cn(
                    'h-3 w-3 rounded-full mb-1',
                    i <= currentStep ? 'bg-[#1B0B94]' : 'bg-[#c4b49c]/30'
                  )} />
                  <span className={cn(
                    'text-[10px] font-body',
                    i <= currentStep ? 'text-[#1B0B94]' : 'text-[#8a7d6b]'
                  )}>
                    {statusLabels[step]}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative mt-[-22px] mx-[6px] h-0.5 bg-[#c4b49c]/20">
              <div
                className="absolute h-full bg-[#1B0B94] transition-all"
                style={{ width: `${Math.max(0, currentStep / (statusSteps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="mb-6">
          <h3 className="font-body text-sm font-semibold text-[#1a1510] mb-3">Articles</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#c4b49c]/10 last:border-0">
                <div>
                  <p className="text-sm text-[#1a1510] font-body">{item.productName}</p>
                  <p className="text-xs text-[#8a7d6b] font-body">
                    Taille: {item.size}{item.color ? ` | Couleur: ${item.color}` : ''} | Qte: {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium text-[#1a1510] font-body">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-[#c4b49c]/10 pt-4 mb-6">
          <div className="flex justify-between text-sm font-body text-[#5a4d3e] mb-1">
            <span>Sous-total</span>
            <span>{formatPrice(order.total - order.shipping)}</span>
          </div>
          <div className="flex justify-between text-sm font-body text-[#5a4d3e] mb-2">
            <span>Livraison</span>
            <span>{order.shipping === 0 ? 'Offerte' : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold font-body text-[#1a1510]">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Shipping address */}
        {order.customer && (
          <div>
            <h3 className="font-body text-sm font-semibold text-[#1a1510] mb-2">Adresse de livraison</h3>
            <p className="text-sm text-[#5a4d3e] font-body">
              {order.customer.firstName} {order.customer.lastName}<br />
              {order.customer.address}<br />
              {order.customer.postalCode} {order.customer.city}<br />
              {order.customer.country}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
