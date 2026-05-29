import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const search = (searchParams.get('search') ?? '').trim().toLowerCase();
  const status = searchParams.get('status') ?? 'all';

  const supabase = createAdminClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('newsletter_subscribers')
    .select('id, email, consent_at, source, unsubscribed_at', { count: 'exact' })
    .order('consent_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike('email', `%${search}%`);
  }
  if (status === 'active') {
    query = query.is('unsubscribed_at', null);
  } else if (status === 'unsubscribed') {
    query = query.not('unsubscribed_at', 'is', null);
  }

  const { data, count, error } = await query;
  if (error) {
    console.error('[admin newsletter] list failed:', error);
    return NextResponse.json({ error: 'Lecture impossible' }, { status: 500 });
  }

  return NextResponse.json({
    subscribers: data ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  });
}
