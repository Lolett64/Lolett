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

  const [{ data: look, error: lookError }, { data: lp }] = await Promise.all([
    supabase.from('looks').select('*').eq('id', id).single(),
    supabase
      .from('look_products')
      .select('product_id, position')
      .eq('look_id', id)
      .order('position'),
  ]);

  if (lookError) {
    return NextResponse.json({ error: lookError.message }, { status: 404 });
  }

  return NextResponse.json({ look: { ...look, lookProducts: lp ?? [] } });
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
  const body = (await request.json()) as {
    title?: string;
    gender?: string;
    cover_image?: string;
    vibe?: string;
    short_pitch?: string;
    productIds?: string[];
  };

  const { productIds, ...lookData } = body;

  const { data: look, error: lookError } = await supabase
    .from('looks')
    .update({ ...lookData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (lookError) {
    return NextResponse.json({ error: lookError.message }, { status: 500 });
  }

  // Update look_products if provided
  if (productIds !== undefined) {
    await supabase.from('look_products').delete().eq('look_id', id);
    if (productIds.length > 0) {
      const lookProducts = productIds.map((pid, idx) => ({
        look_id: id,
        product_id: pid,
        position: idx,
      }));
      const { error: lpError } = await supabase.from('look_products').insert(lookProducts);
      if (lpError) {
        return NextResponse.json({ error: lpError.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ look });
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

  // Delete look_products first (FK constraint)
  await supabase.from('look_products').delete().eq('look_id', id);
  const { error } = await supabase.from('looks').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
