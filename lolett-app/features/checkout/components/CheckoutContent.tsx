'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useCartStore, useCartCalculation, OrderSummary } from '@/features/cart';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { CheckoutForm } from './CheckoutForm';

export function CheckoutContent() {
  const items = useCartStore((state) => state.items);
  const { cartProducts } = useCartCalculation(items);

  if (cartProducts.length === 0) {
    return (
      <div className="pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="container">
          <EmptyCart
            title="Ton panier est vide"
            message="Ajoute des pièces à ton panier avant de passer commande."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-lolett-gray-100 min-h-screen pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="container">
        <Link
          href="/panier"
          className="text-lolett-gray-600 hover:text-lolett-blue touch-target mb-6 inline-flex items-center gap-2 transition-colors sm:mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour au panier</span>
        </Link>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
          <CheckoutForm />
          <div>
            <OrderSummary items={items} variant="checkout" />
          </div>
        </div>
      </div>
    </div>
  );
}
