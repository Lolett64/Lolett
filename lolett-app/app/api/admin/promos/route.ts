import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET() {
  const { data, error } = await admin
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const { data, error } = await admin
    .from('promo_codes')
    .insert({
      code: body.code.toUpperCase().trim(),
      description: body.description || null,
      type: body.type,
      value: body.value,
      min_order: body.min_order || 0,
      usage_limit: body.usage_limit || null,
      active: body.active ?? true,
      starts_at: body.starts_at || new Date().toISOString(),
      expires_at: body.expires_at || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, ...updates } = body;

  if (updates.code) updates.code = updates.code.toUpperCase().trim();

  const { data, error } = await admin
    .from('promo_codes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await admin.from('promo_codes').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
