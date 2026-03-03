import { createClient } from '@/lib/supabase/client';
import type { UserAddress } from '@/types';

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
