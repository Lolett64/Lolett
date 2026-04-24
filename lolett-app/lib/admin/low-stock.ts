import { createAdminClient } from '@/lib/supabase/admin';
import { STOCK } from '@/lib/constants';

export interface LowStockVariant {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  colorName: string;
  colorHex: string;
  size: string;
  stock: number;
}

type SupabaseClient = ReturnType<typeof createAdminClient>;

interface FetchVariantsOptions {
  supabase?: SupabaseClient;
  limit?: number;
}

type JoinedVariantRow = {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string;
  size: string;
  stock: number;
  products: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

function normaliseProduct(
  product: JoinedVariantRow['products'],
): { name: string; slug: string } {
  if (!product) {
    return { name: '—', slug: '' };
  }
  if (Array.isArray(product)) {
    return product[0] ?? { name: '—', slug: '' };
  }
  return product;
}

function mapRow(row: JoinedVariantRow): LowStockVariant {
  const product = normaliseProduct(row.products);
  return {
    id: row.id,
    productId: row.product_id,
    productName: product.name,
    productSlug: product.slug,
    colorName: row.color_name,
    colorHex: row.color_hex,
    size: row.size,
    stock: row.stock ?? 0,
  };
}

/**
 * Récupère les variantes dont le stock est strictement supérieur à 0
 * mais inférieur au seuil `STOCK.LOW_THRESHOLD` (défaut 3).
 * Triées par stock croissant — les plus urgentes d'abord.
 */
export async function getLowStockVariants(
  options: FetchVariantsOptions = {},
): Promise<LowStockVariant[]> {
  const supabase = options.supabase ?? createAdminClient();
  const limit = options.limit ?? 20;

  const { data, error } = await supabase
    .from('product_variants')
    .select('id, product_id, color_name, color_hex, size, stock, products ( name, slug )')
    .gt('stock', 0)
    .lt('stock', STOCK.LOW_THRESHOLD)
    .order('stock', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('[getLowStockVariants]', error.message);
    return [];
  }

  return (data as unknown as JoinedVariantRow[] | null ?? []).map(mapRow);
}

/**
 * Récupère les variantes en rupture de stock (stock = 0),
 * utiles pour repérer ce qui doit être réassorti en urgence.
 */
export async function getOutOfStockVariants(
  options: FetchVariantsOptions = {},
): Promise<LowStockVariant[]> {
  const supabase = options.supabase ?? createAdminClient();
  const limit = options.limit ?? 20;

  const { data, error } = await supabase
    .from('product_variants')
    .select('id, product_id, color_name, color_hex, size, stock, products ( name, slug )')
    .eq('stock', 0)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getOutOfStockVariants]', error.message);
    return [];
  }

  return (data as unknown as JoinedVariantRow[] | null ?? []).map(mapRow);
}
