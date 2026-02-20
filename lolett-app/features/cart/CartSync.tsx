'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useCartStore } from './store';
import { mergeCartsOnLogin, saveServerCart } from './sync';

/**
 * Invisible component that syncs cart with Supabase when user logs in/out.
 * Mount once in the app layout.
 */
export function CartSync() {
  const { user } = useAuth();
  const prevUserId = useRef<string | null>(null);

  // On login: merge local cart with server cart
  useEffect(() => {
    const userId = user?.id ?? null;

    // User just logged in
    if (userId && prevUserId.current !== userId) {
      const localItems = useCartStore.getState().items;
      mergeCartsOnLogin(userId, localItems).then((mergedItems) => {
        useCartStore.setState({ items: mergedItems });
      });
    }

    // User just logged out: keep local cart as-is (already in localStorage)

    prevUserId.current = userId;
  }, [user?.id]);

  // When cart changes while logged in, sync to server
  useEffect(() => {
    if (!user?.id) return;

    const unsub = useCartStore.subscribe((state) => {
      saveServerCart(user.id, state.items);
    });

    return unsub;
  }, [user?.id]);

  return null;
}
