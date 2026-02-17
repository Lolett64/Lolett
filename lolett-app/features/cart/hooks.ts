import { useMemo } from 'react';
import type { CartItem, Product } from '@/types';
import { getProductById } from '@/data/products';
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
}

export function useCartCalculation(items: CartItem[]): CartCalculation {
  return useMemo(() => {
    const cartProducts = items
      .map((item) => {
        const product = getProductById(item.productId);
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
    };
  }, [items]);
}
