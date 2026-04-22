import { createPublicClient } from '@/lib/supabase/public';
import type { LookRepository } from './types';
import type { Look } from '@/types';
import type { DbLook } from './supabase-types';
import { mapLook } from './supabase-mappers';

export class SupabaseLookRepository implements LookRepository {
  async findMany(options?: { gender?: string; limit?: number }): Promise<Look[]> {
    const supabase = createPublicClient();
    let query = supabase.from('looks').select('*, look_products(product_id)');

    if (options?.gender) {
      query = query.eq('gender', options.gender);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[SupabaseLookRepository.findMany]', error.message);
      return [];
    }
    return (data as DbLook[]).map(mapLook);
  }

  async findById(id: string): Promise<Look | null> {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('looks')
      .select('*, look_products(product_id)')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.error('[SupabaseLookRepository.findById]', error.message);
      return null;
    }
    return data ? mapLook(data as DbLook) : null;
  }

  async findByGender(gender: string): Promise<Look[]> {
    return this.findMany({ gender });
  }

  async findLooksForProduct(productId: string): Promise<Look[]> {
    const supabase = createPublicClient();
    const { data: junctionRows, error: junctionError } = await supabase
      .from('look_products')
      .select('look_id')
      .eq('product_id', productId);

    if (junctionError) {
      console.error('[SupabaseLookRepository.findLooksForProduct]', junctionError.message);
      return [];
    }
    if (!junctionRows || junctionRows.length === 0) return [];

    const lookIds = junctionRows.map((r) => r.look_id as string);

    const { data, error } = await supabase
      .from('looks')
      .select('*, look_products(product_id)')
      .in('id', lookIds);

    if (error) {
      console.error('[SupabaseLookRepository.findLooksForProduct] fetch looks', error.message);
      return [];
    }
    return (data as DbLook[]).map(mapLook);
  }
}

export const lookRepository = new SupabaseLookRepository();
