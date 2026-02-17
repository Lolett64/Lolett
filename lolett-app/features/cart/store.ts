'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Size } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (productId: string, size: Size, quantity?: number) => void;
  removeItem: (productId: string, size: Size) => void;
  updateQuantity: (productId: string, size: Size, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: (getProductPrice: (id: string) => number) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId: string, size: Size, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === productId && item.size === size
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
                quantity,
                addedAt: new Date().toISOString(),
              },
            ],
          };
        });
      },

      removeItem: (productId: string, size: Size) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.size === size)
          ),
        }));
      },

      updateQuantity: (productId: string, size: Size, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.size === size ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

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
