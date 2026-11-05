import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  CATEGORY_FIELDS_REQUIRED,
  categoryGendersFromBody,
  categorySlugFromBody,
  duplicateCategorySlugMessage,
} from '@/lib/category-options';

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('gender')
    .order('label');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Count products per category_slug
  const { data: products } = await supabase
    .from('products')
    .select('category_slug');

  const productCounts: Record<string, number> = {};
  if (products) {
    for (const p of products) {
      const slug = p.category_slug;
      if (slug) {
        productCounts[slug] = (productCounts[slug] || 0) + 1;
      }
    }
  }

  return NextResponse.json({ categories: data, productCounts });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { label, seo_title, seo_description } = body;
  const slug = categorySlugFromBody(body);
  // Homme et Femme cochés = une ligne par genre, insérées ensemble (tout ou rien).
  const genders = categoryGendersFromBody(body);

  if (genders.length === 0 || !slug || !label) {
    return NextResponse.json({ error: CATEGORY_FIELDS_REQUIRED }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('categories')
    .insert(
      genders.map((gender) => ({
        gender,
        slug,
        label,
        seo_title: seo_title || null,
        seo_description: seo_description || null,
      })),
    )
    .select();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: duplicateCategorySlugMessage(slug) }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
