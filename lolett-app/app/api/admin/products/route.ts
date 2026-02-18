import { NextResponse } from 'next/server';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  if (!checkAdminCookieFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const gender = searchParams.get('gender');
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') ?? 'created_at';
  const order = searchParams.get('order') ?? 'desc';

  const supabase = createAdminClient();
  let query = supabase.from('products').select('*');

  if (gender) query = query.eq('gender', gender);
  if (category) query = query.eq('category_slug', category);
  if (search) query = query.ilike('name', `%${search}%`);

  const validSortFields = ['created_at', 'price', 'stock', 'name'];
  const sortField = validSortFields.includes(sort) ? sort : 'created_at';
  query = query.order(sortField, { ascending: order === 'asc' });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data ?? [] });
}

export async function POST(request: Request) {
  if (!checkAdminCookieFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const body = (await request.json()) as Record<string, unknown>;
  
  // Extraire les variantes du body
  const { variants, ...productData } = body;

  // Insérer le produit
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 });
  }

  // Insérer les variantes si fournies
  if (variants && Array.isArray(variants) && variants.length > 0) {
    const variantRecords = variants.map((v: { colorName: string; colorHex: string; size: string; stock: number }) => ({
      product_id: product.id,
      color_name: v.colorName,
      color_hex: v.colorHex,
      size: v.size,
      stock: v.stock,
    }));

    const { error: variantError } = await supabase
      .from('product_variants')
      .insert(variantRecords);

    if (variantError) {
      // Rollback: supprimer le produit si les variantes échouent
      await supabase.from('products').delete().eq('id', product.id);
      return NextResponse.json({ error: `Erreur lors de la création des variantes: ${variantError.message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ product }, { status: 201 });
}
