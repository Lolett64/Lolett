'use client';

import { useEffect, useState } from 'react';
import { useCartStore, useCartCalculation } from '@/features/cart';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { CheckoutStyles } from './CheckoutStyles';
import { CheckoutLayout } from './CheckoutLayout';
import { useCheckout } from '../hooks/useCheckout';

export function CheckoutContent() {
  const items = useCartStore((state) => state.items);
  const { cartProducts, subtotal, shipping, total, loading } = useCartCalculation(items);

  const checkout = useCheckout();

  // Hydration guard : Zustand persist lit localStorage uniquement côté client.
  // Sans ce garde, SSR rend "panier vide" pendant qu'après hydration le client
  // a un panier plein → React #418 (hydration mismatch).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const isLoadingProducts = hydrated && items.length > 0 && (loading || cartProducts.length === 0);

  if (!hydrated || isLoadingProducts) {
    return (
      <div style={{ paddingTop: 80, paddingBottom: 64, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: 28, height: 28, border: '2px solid #e8dfd0', borderTopColor: '#B89547', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ paddingTop: 80, paddingBottom: 64 }}>
        <div className="container">
          <EmptyCart
            title="Ton panier est vide"
            message="Ajoute des pieces a ton panier avant de passer commande."
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <CheckoutStyles />
      <CheckoutLayout
        checkout={checkout}
        cartProducts={cartProducts}
        subtotal={subtotal}
        shipping={shipping}
        total={total}
      />
    </>
  );
}
