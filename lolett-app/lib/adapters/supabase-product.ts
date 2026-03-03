import { createClient } from '@/lib/supabase/server';
import type { ProductRepository } from './types';
import type { Product, ProductVariant } from '@/types';
import type { DbProduct, DbProductVariant } from './supabase-types';
import { mapProduct, mapVariant } from './supabase-mappers';

async function loadProductVariants(supabase: Awaited<ReturnType<typeof createClient>>, productId: string): Promise<ProductVariant[]> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId);

  if (error) {
    console.error('[loadProductVariants]', error.message);
    return [];
  }

  return (data as DbProductVariant[]).map(mapVariant);
}

export class SupabaseProductRepository implements ProductRepository {
  async findMany(options?: {
    gender?: string;
    category?: string;
    isNew?: boolean;
    limit?: number;
  }): Promise<Product[]> {
    const supabase = await createClient();
    let query = supabase.from('products').select('*');

    if (options?.gender) {
      query = query.eq('gender', options.gender);
    }
    if (options?.category) {
      query = query.eq('category_slug', options.category);
    }
    if (options?.isNew) {
      query = query.eq('is_new', true);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[SupabaseProductRepository.findMany]', error.message);
      return [];
    }

    const products = await Promise.all(
      (data as DbProduct[]).map(async (row) => {
        const variants = await loadProductVariants(supabase, row.id);
        return mapProduct(row, variants);
      })
    );

    return products;
  }

  async findById(id: string): Promise<Product | null> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    if (error) {
      console.error('[SupabaseProductRepository.findById]', error.message);
      return null;
    }
    if (!data) return null;
    const variants = await loadProductVariants(supabase, id);
    return mapProduct(data as DbProduct, variants);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      console.error('[SupabaseProductRepository.findBySlug]', error.message);
      return null;
    }
    if (!data) return null;
    const variants = await loadProductVariants(supabase, data.id);
    return mapProduct(data as DbProduct, variants);
  }

  async findByCategory(gender: string, categorySlug: string): Promise<Product[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('gender', gender)
      .eq('category_slug', categorySlug);
    if (error) {
      console.error('[SupabaseProductRepository.findByCategory]', error.message);
      return [];
    }

    const products = await Promise.all(
      (data as DbProduct[]).map(async (row) => {
        const variants = await loadProductVariants(supabase, row.id);
        return mapProduct(row, variants);
      })
    );

    return products;
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    const supabase = await createClient();
    const { data, error } = await supabase.from('products').select('*').in('id', ids);
    if (error) {
      console.error('[SupabaseProductRepository.findByIds]', error.message);
      return [];
    }

    const productsMap = new Map<string, Product>();
    await Promise.all(
      (data as DbProduct[]).map(async (row) => {
        const variants = await loadProductVariants(supabase, row.id);
        productsMap.set(row.id, mapProduct(row, variants));
      })
    );

    // Preserve the requested order
    return ids.flatMap((id) => {
      const product = productsMap.get(id);
      return product ? [product] : [];
    });
  }
}

export const productRepository = new SupabaseProductRepository();
