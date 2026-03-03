'use client';

import { useCartStore, useCartCalculation } from '@/features/cart';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { CheckoutStyles } from './CheckoutStyles';
import { CheckoutLayout } from './CheckoutLayout';
import { useCheckout } from '../hooks/useCheckout';

export function CheckoutContent() {
  const items = useCartStore((state) => state.items);
  const { cartProducts, subtotal, shipping, total } = useCartCalculation(items);

  const checkout = useCheckout();

  if (cartProducts.length === 0) {
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
