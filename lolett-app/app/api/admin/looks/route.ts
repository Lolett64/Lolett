import { NextResponse } from 'next/server';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: looks, error } = await supabase
    .from('looks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch products for each look
  const looksWithProducts = await Promise.all(
    (looks ?? []).map(async (look: Record<string, unknown>) => {
      const { data: lp } = await supabase
        .from('look_products')
        .select('product_id, position')
        .eq('look_id', look.id)
        .order('position');
      return { ...look, lookProducts: lp ?? [] };
    })
  );

  return NextResponse.json({ looks: looksWithProducts });
}

export async function POST(request: Request) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const body = (await request.json()) as {
    title: string;
    gender: string;
    cover_image: string;
    vibe: string;
    short_pitch: string;
    productIds: string[];
  };

  const { productIds, ...lookData } = body;

  const { data: look, error: lookError } = await supabase
    .from('looks')
    .insert([lookData])
    .select()
    .single();

  if (lookError) {
    return NextResponse.json({ error: lookError.message }, { status: 500 });
  }

  // Insert look_products
  if (productIds && productIds.length > 0) {
    const lookProducts = productIds.map((pid, idx) => ({
      look_id: (look as Record<string, unknown>).id as string,
      product_id: pid,
      position: idx,
    }));
    const { error: lpError } = await supabase.from('look_products').insert(lookProducts);
    if (lpError) {
      return NextResponse.json({ error: lpError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ look }, { status: 201 });
}
