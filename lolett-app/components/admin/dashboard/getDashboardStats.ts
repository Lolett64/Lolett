import { createAdminClient } from '@/lib/supabase/admin';

export interface DailyRevenue {
  date: string;
  count: number;
  revenue: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface DashboardStats {
  totalProducts: number;
  ordersToday: number;
  ordersPending: number;
  totalStock: number;
  totalRevenue: number;
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
  ordersByDay: DailyRevenue[];
  ordersByStatus: StatusCount[];
  productsByGender: { homme: number; femme: number };
}

export interface RecentOrder {
  id: string;
  order_number: string;
  customer: { firstName: string; lastName: string; email: string };
  total: number;
  status: string;
  created_at: string;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  gender: string;
  category_slug: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    { count: totalProducts },
    { count: ordersToday },
    { count: ordersPending },
    { data: stockSumData },
    { data: recentOrders },
    { data: lowStockProducts },
    { data: last7DaysOrders },
    { data: allOrders },
    { data: allProductsGender },
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
    // Orders last 7 days (for chart)
    supabase
      .from('orders')
      .select('created_at, total')
      .gte('created_at', sevenDaysAgo.toISOString()),
    // All orders for status distribution + total revenue
    supabase
      .from('orders')
      .select('status, total'),
    // Products by gender
    supabase
      .from('products')
      .select('gender'),
  ]);

  const totalStock = (stockSumData ?? []).reduce(
    (sum: number, p: { stock: number }) => sum + (p.stock ?? 0),
    0
  );

  // Orders by day (last 7 days)
  const dayMap: Record<string, { count: number; revenue: number }> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dayMap[key] = { count: 0, revenue: 0 };
  }
  for (const o of last7DaysOrders ?? []) {
    const key = (o.created_at as string).slice(0, 10);
    if (dayMap[key]) {
      dayMap[key].count++;
      dayMap[key].revenue += (o.total as number) ?? 0;
    }
  }
  const ordersByDay: DailyRevenue[] = Object.entries(dayMap).map(([date, v]) => ({
    date,
    count: v.count,
    revenue: Math.round(v.revenue * 100) / 100,
  }));

  // Orders by status
  const statusMap: Record<string, number> = {};
  let totalRevenue = 0;
  for (const o of allOrders ?? []) {
    const s = (o.status as string) || 'unknown';
    statusMap[s] = (statusMap[s] || 0) + 1;
    totalRevenue += (o.total as number) ?? 0;
  }
  const ordersByStatus: StatusCount[] = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count,
  }));

  // Products by gender
  let homme = 0;
  let femme = 0;
  for (const p of allProductsGender ?? []) {
    if ((p.gender as string) === 'homme') homme++;
    else if ((p.gender as string) === 'femme') femme++;
  }

  return {
    totalProducts: totalProducts ?? 0,
    ordersToday: ordersToday ?? 0,
    ordersPending: ordersPending ?? 0,
    totalStock,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    recentOrders: (recentOrders ?? []) as RecentOrder[],
    lowStockProducts: (lowStockProducts ?? []) as LowStockProduct[],
    ordersByDay,
    ordersByStatus,
    productsByGender: { homme, femme },
  };
}
