'use client';

import Link from 'next/link';
import { useCartStore, useCartCalculation } from '@/features/cart';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { CartSuggestions } from '@/components/cart/CartSuggestions';

export default function PanierPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const { cartProducts, subtotal, shipping, total, isFreeShipping, itemCount, amountUntilFreeShipping } =
    useCartCalculation(items);

  return (
    <div style={{ background: '#FDF5E6', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 20px 80px' }}>
        <h1 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 34, color: '#1a1510', fontWeight: 400, marginBottom: 6 }}>
          Mon panier
        </h1>
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: '#9B8E82', marginBottom: 40, letterSpacing: 0.5 }}>
          {itemCount} article{itemCount > 1 ? 's' : ''}
        </p>

        {cartProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 22, color: '#5a4d3e', marginBottom: 24 }}>Votre panier est vide</p>
            <Link href="/shop" style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: '#B89547', textDecoration: 'underline', textUnderlineOffset: 4 }}>
              Découvrir la collection
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: '1 1 520px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {cartProducts.map((item) => (
                  <CartItem
                    key={`${item.productId}-${item.size}-${item.color || ''}`}
                    item={item}
                    removeItem={removeItem}
                    updateQuantity={updateQuantity}
                  />
                ))}
              </div>
              <CartSummary
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                isFreeShipping={isFreeShipping}
                amountUntilFreeShipping={amountUntilFreeShipping}
              />
            </div>
            <CartSuggestions />
          </>
        )}
      </div>
    </div>
  );
}
