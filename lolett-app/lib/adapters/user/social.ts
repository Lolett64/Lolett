import { createClient } from '@/lib/supabase/client';
import type { UserReview, LoyaltyReward } from '@/types';

// ── Reviews ──────────────────────────────────────────────────────────

export async function getUserReviews(userId: string): Promise<UserReview[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*, products(name, images)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id,
    userId: r.user_id,
    productId: r.product_id,
    rating: r.rating,
    comment: r.comment,
    flagged: r.flagged ?? false,
    flagCount: r.flag_count ?? 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    productName: r.products?.name,
    productImage: r.products?.images?.[0],
  }));
}

export async function deleteReview(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('reviews').delete().eq('id', id);
}

// ── Favorites ────────────────────────────────────────────────────────

export async function getFavorites(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', userId);

  if (error || !data) return [];
  return data.map((f) => f.product_id);
}

export async function addFavorite(userId: string, productId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('favorites').upsert({
    user_id: userId,
    product_id: productId,
  });
}

export async function removeFavorite(userId: string, productId: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
}

// ── Loyalty ──────────────────────────────────────────────────────────

export async function getLoyaltyRewards(): Promise<LoyaltyReward[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('loyalty_rewards')
    .select('*')
    .eq('is_active', true)
    .order('points_cost', { ascending: true });

  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    pointsCost: r.points_cost,
    rewardType: r.reward_type,
    value: r.value,
    isActive: r.is_active,
  }));
}
