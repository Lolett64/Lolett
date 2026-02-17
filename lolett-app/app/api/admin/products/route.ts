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

  const { data, error } = await supabase
    .from('products')
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data }, { status: 201 });
}
