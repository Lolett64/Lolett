import { createClient } from '@/lib/supabase/client';
import type { UserProfile, UserAddress, UserReview, LoyaltyReward, Order } from '@/types';

// ── Profile ──────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    phone: data.phone,
    avatarUrl: data.avatar_url,
    loyaltyPoints: data.loyalty_points ?? 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateProfile(
  userId: string,
  data: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'phone'>>
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from('profiles')
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
}

// ── Addresses ────────────────────────────────────────────────────────

export async function getAddresses(userId: string): Promise<UserAddress[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  if (error || !data) return [];

  return data.map((a) => ({
    id: a.id,
    userId: a.user_id,
    label: a.label,
    firstName: a.first_name,
    lastName: a.last_name,
    address: a.address,
    city: a.city,
    postalCode: a.postal_code,
    country: a.country,
    isDefault: a.is_default,
  }));
}

export async function createAddress(
  userId: string,
  data: Omit<UserAddress, 'id' | 'userId'>
): Promise<UserAddress | null> {
  const supabase = createClient();

  // If setting as default, unset others first
  if (data.isDefault) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  const { data: row, error } = await supabase
    .from('addresses')
    .insert({
      user_id: userId,
      label: data.label,
      first_name: data.firstName,
      last_name: data.lastName,
      address: data.address,
      city: data.city,
      postal_code: data.postalCode,
      country: data.country,
      is_default: data.isDefault,
    })
    .select()
    .single();

  if (error || !row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    firstName: row.first_name,
    lastName: row.last_name,
    address: row.address,
    city: row.city,
    postalCode: row.postal_code,
    country: row.country,
    isDefault: row.is_default,
  };
}

export async function updateAddress(
  id: string,
  userId: string,
  data: Partial<Omit<UserAddress, 'id' | 'userId'>>
): Promise<void> {
  const supabase = createClient();

  if (data.isDefault) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  await supabase
    .from('addresses')
    .update({
      ...(data.label !== undefined && { label: data.label }),
      ...(data.firstName !== undefined && { first_name: data.firstName }),
      ...(data.lastName !== undefined && { last_name: data.lastName }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.postalCode !== undefined && { postal_code: data.postalCode }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.isDefault !== undefined && { is_default: data.isDefault }),
    })
    .eq('id', id);
}

export async function deleteAddress(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('addresses').delete().eq('id', id);
}

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

// ── Orders ───────────────────────────────────────────────────────────

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    items: (o.order_items ?? []).map((item: { product_id: string; product_name: string; size: string; quantity: number; price: number; color?: string }) => ({
      productId: item.product_id,
      productName: item.product_name,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
      color: item.color,
    })),
    customer: o.customer ?? {},
    total: o.total,
    shipping: o.shipping,
    status: o.status,
    paymentProvider: o.payment_provider,
    paymentId: o.payment_id,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  }));
}

export async function getOrderById(orderId: string, userId: string): Promise<Order | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    orderNumber: data.order_number,
    items: (data.order_items ?? []).map((item: { product_id: string; product_name: string; size: string; quantity: number; price: number; color?: string }) => ({
      productId: item.product_id,
      productName: item.product_name,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
      color: item.color,
    })),
    customer: data.customer ?? {},
    total: data.total,
    shipping: data.shipping,
    status: data.status,
    paymentProvider: data.payment_provider,
    paymentId: data.payment_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
