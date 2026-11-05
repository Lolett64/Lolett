import { createAdminClient } from '@/lib/supabase/admin';
import { gendersFollowingCategory, type ShopGender } from '@/lib/gender';

type AdminClient = ReturnType<typeof createAdminClient>;

export interface CategoryKey {
  id: string;
  gender: ShopGender;
}

/** Une autre catégorie (autre que `id`) porte-t-elle ce slug ? Filtre optionnel par genre. */
export async function otherCategoryHasSlug(
  supabase: AdminClient,
  id: string,
  slug: string,
  gender?: ShopGender,
): Promise<{ found: boolean; error: string | null }> {
  let query = supabase.from('categories').select('id').eq('slug', slug).neq('id', id);
  if (gender) query = query.eq('gender', gender);
  const { data, error } = await query.limit(1);
  if (error) return { found: false, error: error.message };
  return { found: (data ?? []).length > 0, error: null };
}

/**
 * Bascule les produits d'une catégorie de `from` vers `to`, en une seule écriture.
 * Renvoie les ids déplacés, pour pouvoir les remettre si la suite échoue.
 */
export async function moveCategoryProducts(
  supabase: AdminClient,
  category: CategoryKey,
  from: string,
  to: string,
): Promise<{ ids: string[]; error: string | null }> {
  const other = await otherCategoryHasSlug(supabase, category.id, from);
  if (other.error) return { ids: [], error: other.error };

  const { data, error } = await supabase
    .from('products')
    .select('id')
    .eq('category_slug', from)
    .in('gender', gendersFollowingCategory(category.gender, other.found));
  if (error) return { ids: [], error: error.message };

  const ids = (data ?? []).map((p: { id: string }) => p.id);
  if (ids.length === 0) return { ids, error: null };
  const moved = await setProductsCategory(supabase, ids, to);
  return moved ? { ids: [], error: moved } : { ids, error: null };
}

/** Range ces produits dans la catégorie `slug`. Renvoie le message d'erreur éventuel. */
export async function setProductsCategory(
  supabase: AdminClient,
  ids: string[],
  slug: string,
): Promise<string | null> {
  const { error } = await supabase.from('products').update({ category_slug: slug }).in('id', ids);
  return error ? error.message : null;
}
