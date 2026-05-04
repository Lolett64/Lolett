import { useMemo, useEffect, useState, useRef } from 'react';
import type { CartItem, Product, ShippingCountryCode, ShippingMethod } from '@/types';
import {
  computeShippingCost,
  getShippingZone,
  SHIPPING_FREE_THRESHOLD,
  SHIPPING_RATES,
} from '@/lib/constants';
import { computePromoDiscount, type PromoType } from '@/lib/promo/discount';
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

export interface ValidatedPromo {
  code: string;
  type: PromoType;
  value: number;
  description?: string;
}

export interface UseValidatedPromoResult {
  promo: ValidatedPromo | null;
  promoAmount: number;
  error: string | null;
  validating: boolean;
}

// Re-valide le code promo via l'API à chaque changement de subtotal pour éviter
// un état figé dans le localStorage (faille où l'utilisateur appliquait le code
// avec un panier gonflé puis retirait des articles en gardant la réduction).
// La source de vérité est toujours la DB, jamais le store client.
export function useValidatedPromo(subtotal: number): UseValidatedPromoResult {
  const code = useCartStore((s) => s.promo?.code ?? null);
  const clearPromo = useCartStore((s) => s.clearPromo);

  const [promo, setPromo] = useState<ValidatedPromo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const lastSigRef = useRef<string | null>(null);

  useEffect(() => {
    if (!code || subtotal <= 0) {
      setPromo(null);
      setError(null);
      return;
    }

    const sig = `${code}:${subtotal.toFixed(2)}`;
    if (sig === lastSigRef.current) return;

    let cancelled = false;
    setValidating(true);

    const timer = setTimeout(() => {
      fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      })
        .then(async (res) => {
          const data = await res.json().catch(() => null);
          if (cancelled) return;
          lastSigRef.current = sig;
          if (res.ok && data?.valid) {
            setPromo({
              code: data.code,
              type: data.type,
              value: Number(data.value),
              description: data.description,
            });
            setError(null);
          } else {
            setPromo(null);
            setError(data?.error ?? 'Code promo invalide');
            clearPromo();
          }
        })
        .catch(() => {
          if (cancelled) return;
          setError('Impossible de vérifier le code promo');
        })
        .finally(() => {
          if (!cancelled) setValidating(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code, subtotal, clearPromo]);

  const promoAmount = useMemo(
    () => (promo ? computePromoDiscount(promo.type, promo.value, subtotal) : 0),
    [promo, subtotal],
  );

  return { promo, promoAmount, error, validating };
}
