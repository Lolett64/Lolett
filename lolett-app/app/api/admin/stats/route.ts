import { NextResponse } from 'next/server';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  if (!checkAdminCookieFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { count: totalProducts },
    { count: ordersToday },
    { count: ordersPending },
    { data: stockSumData },
    { data: recentOrders },
    { data: lowStockProducts },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'paid']),
    supabase.from('products').select('stock'),
    supabase
      .from('orders')
      .select('id, order_number, customer, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('products')
      .select('id, name, stock, gender, category_slug')
      .lt('stock', 3)
      .order('stock', { ascending: true })
      .limit(10),
  ]);

  const totalStock = (stockSumData ?? []).reduce(
    (sum: number, p: { stock: number }) => sum + (p.stock ?? 0),
    0
  );

  return NextResponse.json({
    totalProducts: totalProducts ?? 0,
    ordersToday: ordersToday ?? 0,
    ordersPending: ordersPending ?? 0,
    totalStock,
    recentOrders: recentOrders ?? [],
    lowStockProducts: lowStockProducts ?? [],
  });
}
