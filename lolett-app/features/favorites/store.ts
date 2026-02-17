'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FavoriteItem } from '@/types';

interface FavoritesState {
  items: FavoriteItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  getCount: () => number;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId: string) => {
        set((state) => {
          if (state.items.some((item) => item.productId === productId)) {
            return state;
          }

          return {
            items: [
              ...state.items,
              {
                productId,
                addedAt: new Date().toISOString(),
              },
            ],
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      toggleItem: (productId: string) => {
        const isFav = get().isFavorite(productId);
        if (isFav) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },

      isFavorite: (productId: string) => {
        return get().items.some((item) => item.productId === productId);
      },

      getCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'lolett-favorites',
    }
  )
);
