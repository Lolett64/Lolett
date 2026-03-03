import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/types';

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
