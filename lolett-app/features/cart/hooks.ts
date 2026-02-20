import { useMemo, useEffect, useState } from 'react';
import type { CartItem, Product } from '@/types';
import { SHIPPING } from '@/lib/constants';

export interface CartProductItem extends CartItem {
  product: Product;
}

export interface CartCalculation {
  cartProducts: CartProductItem[];
  subtotal: number;
  shipping: number;
  total: number;
  isFreeShipping: boolean;
  itemCount: number;
  freeThreshold: number;
  shippingCost: number;
  amountUntilFreeShipping: number;
  loading: boolean;
}

export function useCartCalculation(items: CartItem[]): CartCalculation {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const productIds = useMemo(() => items.map((i) => i.productId), [items]);

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch('/api/products/by-ids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: productIds }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setProducts(data.products ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productIds]);

  return useMemo(() => {
    const cartProducts = items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product ? { ...item, product } : null;
      })
      .filter((item): item is CartProductItem => item !== null);

    const subtotal = cartProducts.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const isFreeShipping = subtotal >= SHIPPING.FREE_THRESHOLD;
    const shipping = isFreeShipping ? 0 : SHIPPING.COST;
    const total = subtotal + shipping;
    const itemCount = cartProducts.reduce((sum, item) => sum + item.quantity, 0);
    const amountUntilFreeShipping = Math.max(0, SHIPPING.FREE_THRESHOLD - subtotal);

    return {
      cartProducts,
      subtotal,
      shipping,
      total,
      isFreeShipping,
      itemCount,
      freeThreshold: SHIPPING.FREE_THRESHOLD,
      shippingCost: SHIPPING.COST,
      amountUntilFreeShipping,
      loading,
    };
  }, [items, products, loading]);
}
