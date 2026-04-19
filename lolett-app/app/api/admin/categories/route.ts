import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

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
  const { gender, slug, label, seo_title, seo_description } = body;

  if (!gender || !slug || !label) {
    return NextResponse.json({ error: 'gender, slug et label sont requis' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('categories')
    .insert({ gender, slug, label, seo_title: seo_title || null, seo_description: seo_description || null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
