import { NextResponse } from 'next/server';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(request: Request) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const sort = searchParams.get('sort') ?? 'created_at';
  const order = searchParams.get('order') ?? 'desc';

  const pageRaw = Number(searchParams.get('page') ?? '1');
  const limitRaw = Number(searchParams.get('limit') ?? String(DEFAULT_LIMIT));
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const limit = Number.isFinite(limitRaw) && limitRaw > 0
    ? Math.min(Math.floor(limitRaw), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = createAdminClient();
  let query = supabase
    .from('orders')
    .select(
      'id, order_number, customer, total, shipping, status, payment_provider, created_at, updated_at',
      { count: 'exact' },
    );

  if (status) query = query.eq('status', status);

  const validSortFields = ['created_at', 'total', 'status'];
  const sortField = validSortFields.includes(sort) ? sort : 'created_at';
  query = query
    .order(sortField, { ascending: order === 'asc' })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  return NextResponse.json({
    orders: data ?? [],
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}
