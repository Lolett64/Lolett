import { NextResponse } from 'next/server';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminCookieFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 404 });
  }

  // Charger les variantes
  const { data: variants, error: variantError } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', id);

  if (variantError) {
    return NextResponse.json({ error: variantError.message }, { status: 500 });
  }

  return NextResponse.json({ 
    product: {
      ...product,
      variants: variants ?? [],
    }
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminCookieFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const body = (await request.json()) as Record<string, unknown>;
  
  // Extraire les variantes du body
  const { variants, ...productData } = body;

  // Mettre à jour le produit
  const { data, error } = await supabase
    .from('products')
    .update({ ...productData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mettre à jour les variantes si fournies
  if (variants !== undefined) {
    // Supprimer toutes les variantes existantes
    const { error: deleteError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', id);

    if (deleteError) {
      return NextResponse.json({ error: `Erreur lors de la suppression des variantes: ${deleteError.message}` }, { status: 500 });
    }

    // Insérer les nouvelles variantes si elles existent
    if (Array.isArray(variants) && variants.length > 0) {
      const variantRecords = variants.map((v: { colorName: string; colorHex: string; size: string; stock: number }) => ({
        product_id: id,
        color_name: v.colorName,
        color_hex: v.colorHex,
        size: v.size,
        stock: v.stock,
      }));

      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantRecords);

      if (variantError) {
        return NextResponse.json({ error: `Erreur lors de la mise à jour des variantes: ${variantError.message}` }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ product: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminCookieFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
