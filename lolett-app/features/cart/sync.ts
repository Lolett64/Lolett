import { createClient } from '@/lib/supabase/client';
import type { CartItem } from '@/types';

const supabase = createClient();

/** Load cart items from Supabase for a given user */
export async function loadServerCart(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId);

  if (error || !data) return [];

  return data.map((row) => ({
    productId: row.product_id,
    size: row.size,
    color: row.color || undefined,
    quantity: row.quantity,
    addedAt: row.created_at,
  }));
}

/** Save full cart to Supabase (replace all items) */
export async function saveServerCart(userId: string, items: CartItem[]): Promise<void> {
  // Delete existing cart
  await supabase.from('cart_items').delete().eq('user_id', userId);

  if (items.length === 0) return;

  // Insert all items
  const rows = items.map((item) => ({
    user_id: userId,
    product_id: item.productId,
    size: item.size,
    color: item.color || null,
    quantity: item.quantity,
  }));

  await supabase.from('cart_items').insert(rows);
}

/** Merge local cart into server cart (keep higher quantities, add new items) */
export async function mergeCartsOnLogin(userId: string, localItems: CartItem[]): Promise<CartItem[]> {
  const serverItems = await loadServerCart(userId);

  // Build a map of server items keyed by productId+size+color
  const merged = new Map<string, CartItem>();

  for (const item of serverItems) {
    const key = `${item.productId}-${item.size}-${item.color || ''}`;
    merged.set(key, item);
  }

  // Merge local items (keep the higher quantity)
  for (const item of localItems) {
    const key = `${item.productId}-${item.size}-${item.color || ''}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity = Math.max(existing.quantity, item.quantity);
    } else {
      merged.set(key, { ...item });
    }
  }

  const mergedItems = Array.from(merged.values());

  // Save merged cart to server
  await saveServerCart(userId, mergedItems);

  return mergedItems;
}
