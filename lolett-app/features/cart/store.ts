'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Size, ShippingCountryCode, ShippingMethod, PickupPoint } from '@/types';

export interface AppliedGiftCard {
  code: string;
  balance: number;
}

export interface AppliedPromo {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
}

interface CartState {
  items: CartItem[];
  giftCard: AppliedGiftCard | null;
  promo: AppliedPromo | null;
  shippingCountry: ShippingCountryCode;
  shippingMethod: ShippingMethod;
  pickupPoint: PickupPoint | null;
  addItem: (productId: string, size: Size, quantity?: number, color?: string) => void;
  removeItem: (productId: string, size: Size, color?: string) => void;
  updateQuantity: (productId: string, size: Size, quantity: number, color?: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: (getProductPrice: (id: string) => number) => number;
  setGiftCard: (giftCard: AppliedGiftCard | null) => void;
  clearGiftCard: () => void;
  setPromo: (promo: AppliedPromo | null) => void;
  clearPromo: () => void;
  setShippingCountry: (country: ShippingCountryCode) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setPickupPoint: (point: PickupPoint | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      giftCard: null,
      promo: null,
      shippingCountry: 'FR',
      shippingMethod: 'home',
      pickupPoint: null,

      addItem: (productId: string, size: Size, quantity = 1, color?: string) => {
        set((state) => {
          // Trouver l'item existant avec la même combinaison productId + size + color
          const existingIndex = state.items.findIndex(
            (item) => 
              item.productId === productId && 
              item.size === size &&
              (item.color || '') === (color || '')
          );

          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += quantity;
            return { items: newItems };
          }

          return {
            items: [
              ...state.items,
              {
                productId,
                size,
                color,
                quantity,
                addedAt: new Date().toISOString(),
              },
            ],
          };
        });
      },

      removeItem: (productId: string, size: Size, color?: string) => {
        set((state) => ({
          items: state.items.filter(
            (item) => 
              !(item.productId === productId && 
                item.size === size &&
                (item.color || '') === (color || ''))
          ),
        }));
      },

      updateQuantity: (productId: string, size: Size, quantity: number, color?: string) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && 
            item.size === size &&
            (item.color || '') === (color || '')
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [], giftCard: null, promo: null, pickupPoint: null }),

      setGiftCard: (giftCard: AppliedGiftCard | null) => set({ giftCard }),
      clearGiftCard: () => set({ giftCard: null }),

      setPromo: (promo: AppliedPromo | null) => set({ promo }),
      clearPromo: () => set({ promo: null }),

      // Réinitialise le mode + point relais quand le pays change pour éviter
      // un état incohérent (ex: point relais FR conservé après bascule ES).
      setShippingCountry: (country) => set({ shippingCountry: country, shippingMethod: 'home', pickupPoint: null }),
      setShippingMethod: (method) => set((state) => ({
        shippingMethod: method,
        pickupPoint: method === 'home' ? null : state.pickupPoint,
      })),
      setPickupPoint: (point) => set({ pickupPoint: point }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotal: (getProductPrice: (id: string) => number) => {
        return get().items.reduce((total, item) => {
          const price = getProductPrice(item.productId);
          return total + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'lolett-cart',
    }
  )
);
