'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Size, ShippingCountryCode, ShippingMethod, PickupPoint, PickupPointProvider } from '@/types';
import { VALID_SHIPPING_METHODS } from '@/lib/constants';

export interface AppliedGiftCard {
  code: string;
  balance: number;
}

export interface AppliedPromo {
  code: string;
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

// Champs réellement persistés (zustand re-fusionne les actions après migrate).
type PersistedCartState = {
  items?: CartItem[];
  giftCard?: CartState['giftCard'];
  promo?: { code?: string } | null;
  shippingCountry?: ShippingCountryCode;
  shippingMethod?: ShippingMethod;
  pickupPoint?: (Record<string, unknown> & { provider?: PickupPointProvider }) | null;
};

// Migration pure et testable du panier persisté.
// v1→v2 : normalise la forme de `promo`. v2→v3 : backfill `provider='mondial_relay'`
// sur l'ancien pickupPoint (sur une COPIE, sans muter l'entrée), reset
// shippingMethod→home + pickupPoint→null si la méthode n'est plus valide.
export function migrateCart(persisted: unknown, version: number): PersistedCartState {
  const input = (persisted ?? {}) as PersistedCartState;
  // Copie de surface — ne jamais muter l'objet passé par zustand/l'appelant.
  const state: PersistedCartState = { ...input };

  // v1→v2 : forme du promo.
  if (version < 2 && state.promo) {
    state.promo = state.promo.code ? { code: state.promo.code } : null;
  }

  // v3 : backfill du discriminant provider sur les snapshots legacy (sur une copie).
  if (version < 3 && state.pickupPoint && !state.pickupPoint.provider) {
    state.pickupPoint = { ...state.pickupPoint, provider: 'mondial_relay' };
  }

  // Reset si la méthode persistée n'est plus supportée (revert deploy / cookie ancien).
  if (
    !state.shippingMethod ||
    !VALID_SHIPPING_METHODS.includes(state.shippingMethod)
  ) {
    state.shippingMethod = 'home';
    state.pickupPoint = null;
  }

  return state;
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
        // Reset au CHANGEMENT de méthode (évite un résidu MR↔C&C).
        // Re-sélectionner la même méthode conserve le point déjà choisi (spec §5.5).
        pickupPoint: state.shippingMethod !== method ? null : state.pickupPoint,
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
      version: 3,
      migrate: (persisted: unknown, version: number) =>
        migrateCart(persisted, version) as unknown as CartState,
    }
  )
);
