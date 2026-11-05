import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { categorySlugFromBody } from '@/lib/category-options';

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Le slug d'une catégorie a changé : ses produits le suivent.
 * Les produits unisexes ne suivent que si plus aucune catégorie (l'autre genre)
 * ne porte l'ancien slug, sinon ils quitteraient cette autre catégorie.
 */
async function moveProducts(supabase: AdminClient, gender: string, oldSlug: string, newSlug: string) {
  await supabase
    .from('products')
    .update({ category_slug: newSlug })
    .eq('category_slug', oldSlug)
    .eq('gender', gender);

  const { data: others } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', oldSlug)
    .limit(1);
  if (!others || others.length === 0) {
    await supabase
      .from('products')
      .update({ category_slug: newSlug })
      .eq('category_slug', oldSlug)
      .eq('gender', 'both');
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { gender, label, seo_title, seo_description } = body;
  const slug = categorySlugFromBody(body);

  if (!gender || !label || !slug) {
    return NextResponse.json({ error: 'Genre, label et slug sont requis' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: before } = await supabase
    .from('categories')
    .select('gender, slug')
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('categories')
    .update({ gender, slug, label, seo_title: seo_title || null, seo_description: seo_description || null })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: `Une catégorie « ${slug} » existe déjà pour ce genre. Choisissez un autre slug.` },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (before && before.slug !== slug) {
    await moveProducts(supabase, before.gender, before.slug, slug);
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
