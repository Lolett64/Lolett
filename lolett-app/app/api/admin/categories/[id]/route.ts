import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isShopGender } from '@/lib/gender';
import {
  CATEGORY_FIELDS_REQUIRED,
  categorySlugFromBody,
  duplicateCategorySlugMessage,
} from '@/lib/category-options';
import { moveCategoryProducts, otherCategoryHasSlug, setProductsCategory } from '@/lib/admin/category-rename';

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

/**
 * Modifier une catégorie. Si son slug change, ses produits le suivent :
 * produits déplacés d'abord (une seule écriture), puis la catégorie renommée ;
 * si ce renommage échoue, les produits reviennent à l'ancien slug.
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body: unknown = await request.json();
  const { gender, label, seo_title, seo_description } = (body ?? {}) as Record<string, unknown>;
  const slug = categorySlugFromBody(body);

  if (typeof gender !== 'string' || !isShopGender(gender) || typeof label !== 'string' || !label || !slug) {
    return fail(CATEGORY_FIELDS_REQUIRED, 400);
  }

  const supabase = createAdminClient();
  const { data: before, error: readError } = await supabase
    .from('categories')
    .select('gender, slug')
    .eq('id', id)
    .maybeSingle();
  if (readError) return fail(readError.message, 500);
  if (!before) return fail('Catégorie introuvable', 404);
  if (before.gender !== gender) {
    return fail("Le genre d'une catégorie existante ne se change pas : créez-la de l'autre côté.", 400);
  }

  let movedIds: string[] = [];
  if (before.slug !== slug) {
    const taken = await otherCategoryHasSlug(supabase, id, slug, gender);
    if (taken.error) return fail(taken.error, 500);
    if (taken.found) return fail(duplicateCategorySlugMessage(slug), 409);

    const moved = await moveCategoryProducts(supabase, { id, gender }, before.slug, slug);
    if (moved.error) return fail(`Rien n'a été modifié : ${moved.error}`, 500);
    movedIds = moved.ids;
  }

  const { data, error } = await supabase
    .from('categories')
    .update({
      slug,
      label,
      seo_title: typeof seo_title === 'string' && seo_title ? seo_title : null,
      seo_description: typeof seo_description === 'string' && seo_description ? seo_description : null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (movedIds.length > 0) await setProductsCategory(supabase, movedIds, before.slug);
    if (error.code === '23505') return fail(duplicateCategorySlugMessage(slug), 409);
    return fail(error.message, 500);
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
