import { useMemo, useEffect, useState } from 'react';
import type { CartItem, Product, ShippingCountryCode, ShippingMethod } from '@/types';
import {
  computeShippingCost,
  getShippingZone,
  SHIPPING_FREE_THRESHOLD,
  SHIPPING_RATES,
} from '@/lib/constants';
import { useCartStore } from './store';

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
  shippingCountry: ShippingCountryCode;
  shippingMethod: ShippingMethod;
}

export function useCartCalculation(items: CartItem[]): CartCalculation {
  const shippingCountry = useCartStore((s) => s.shippingCountry);
  const shippingMethod = useCartStore((s) => s.shippingMethod);
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

    const zone = getShippingZone(shippingCountry);
    const freeThreshold = (zone && SHIPPING_FREE_THRESHOLD[zone]) ?? Number.POSITIVE_INFINITY;
    const baseRate = (zone && SHIPPING_RATES[zone][shippingMethod]) ?? 0;
    const shipping = computeShippingCost(subtotal, shippingCountry, shippingMethod);
    const isFreeShipping = shipping === 0 && subtotal > 0 && Number.isFinite(freeThreshold);
    const total = subtotal + shipping;
    const itemCount = cartProducts.reduce((sum, item) => sum + item.quantity, 0);
    const amountUntilFreeShipping = Number.isFinite(freeThreshold)
      ? Math.max(0, freeThreshold - subtotal)
      : 0;

    return {
      cartProducts,
      subtotal,
      shipping,
      total,
      isFreeShipping,
      itemCount,
      freeThreshold: Number.isFinite(freeThreshold) ? freeThreshold : 0,
      shippingCost: baseRate,
      amountUntilFreeShipping,
      loading,
      shippingCountry,
      shippingMethod,
    };
  }, [items, products, loading, shippingCountry, shippingMethod]);
}
