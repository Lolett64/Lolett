import { createClient } from '@/lib/supabase/server';
import type { CategoryRepository } from './types';
import type { Category } from '@/types';
import type { DbCategory } from './supabase-types';
import { mapCategory } from './supabase-mappers';

export class SupabaseCategoryRepository implements CategoryRepository {
  async findMany(options?: { gender?: string }): Promise<Category[]> {
    const supabase = await createClient();
    let query = supabase.from('categories').select('*');

    if (options?.gender) {
      query = query.eq('gender', options.gender);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[SupabaseCategoryRepository.findMany]', error.message);
      return [];
    }
    return (data as DbCategory[]).map(mapCategory);
  }

  async findBySlug(gender: string, slug: string): Promise<Category | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('gender', gender)
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      console.error('[SupabaseCategoryRepository.findBySlug]', error.message);
      return null;
    }
    return data ? mapCategory(data as DbCategory) : null;
  }

  async findByGender(gender: string): Promise<Category[]> {
    return this.findMany({ gender });
  }
}

export const categoryRepository = new SupabaseCategoryRepository();
