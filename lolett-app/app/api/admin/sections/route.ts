import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const page = request.nextUrl.searchParams.get('page');
  if (!page) {
    return NextResponse.json({ error: 'page parameter required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('page_sections')
    .select('*')
    .eq('page_slug', page)
    .order('sort_order');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { items } = await request.json() as {
    items: { id: string; visible: boolean; sort_order: number }[];
  };

  if (!items?.length) {
    return NextResponse.json({ error: 'items required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  for (const item of items) {
    const { error } = await supabase
      .from('page_sections')
      .update({ visible: item.visible, sort_order: item.sort_order })
      .eq('id', item.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
