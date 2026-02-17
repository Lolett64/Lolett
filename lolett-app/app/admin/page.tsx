import { Suspense } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingBag, Clock, Layers } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/admin/utils';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';

interface DashboardStats {
  totalProducts: number;
  ordersToday: number;
  ordersPending: number;
  totalStock: number;
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer: { firstName: string; lastName: string; email: string };
  total: number;
  status: string;
  created_at: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  gender: string;
  category_slug: string;
}

async function getDashboardStats(): Promise<DashboardStats> {
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

  return {
    totalProducts: totalProducts ?? 0,
    ordersToday: ordersToday ?? 0,
    ordersPending: ordersPending ?? 0,
    totalStock,
    recentOrders: (recentOrders ?? []) as RecentOrder[],
    lowStockProducts: (lowStockProducts ?? []) as LowStockProduct[],
  };
}

async function DashboardContent() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      label: 'Produits',
      value: stats.totalProducts,
      icon: ShoppingBag,
      href: '/admin/products',
    },
    {
      label: 'Commandes aujourd\'hui',
      value: stats.ordersToday,
      icon: Package,
      href: '/admin/orders',
    },
    {
      label: 'En attente',
      value: stats.ordersPending,
      icon: Clock,
      href: '/admin/orders?status=pending',
    },
    {
      label: 'Stock total',
      value: stats.totalStock,
      icon: Layers,
      href: '/admin/products',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-lolett-gray-900">Dashboard</h2>
        <p className="text-sm text-lolett-gray-500 mt-1">Vue d&apos;ensemble de la boutique</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="size-5 text-lolett-gray-400" />
                </div>
                <div className="text-3xl font-bold text-lolett-gray-900">{stat.value}</div>
                <div className="text-xs text-lolett-gray-500 mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Dernières commandes</CardTitle>
              <Link href="/admin/orders" className="text-xs text-lolett-blue hover:underline">
                Voir tout
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="text-sm text-lolett-gray-400 py-4 text-center">Aucune commande</p>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between rounded-lg p-3 hover:bg-lolett-gray-100 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-lolett-gray-900 truncate">
                        {order.order_number}
                      </div>
                      <div className="text-xs text-lolett-gray-500 truncate">
                        {order.customer?.firstName} {order.customer?.lastName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <OrderStatusBadge status={order.status} />
                      <span className="text-sm font-medium">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low stock products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Stock bas (&lt; 3)</CardTitle>
              <Link href="/admin/products" className="text-xs text-lolett-blue hover:underline">
                Gérer
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.lowStockProducts.length === 0 ? (
              <p className="text-sm text-lolett-gray-400 py-4 text-center">
                Aucun produit en stock bas
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.lowStockProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/admin/products/${product.id}/edit`}
                    className="flex items-center justify-between rounded-lg p-3 hover:bg-lolett-gray-100 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-lolett-gray-900 truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-lolett-gray-500">
                        {product.gender} · {product.category_slug}
                      </div>
                    </div>
                    <Badge
                      variant={product.stock === 0 ? 'destructive' : 'outline'}
                      className={product.stock === 0 ? '' : 'border-orange-400 text-orange-600'}
                    >
                      {product.stock === 0 ? 'Épuisé' : `Stock: ${product.stock}`}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="h-8 w-40 rounded bg-lolett-gray-200 animate-pulse" />
        <div className="h-4 w-60 rounded bg-lolett-gray-200 animate-pulse mt-2" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array<undefined>(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-lolett-gray-200 animate-pulse" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-xl bg-lolett-gray-200 animate-pulse" />
        <div className="h-64 rounded-xl bg-lolett-gray-200 animate-pulse" />
      </div>
    </div>
  );
}
