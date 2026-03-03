import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingBag, Clock, Layers, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/admin/utils';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { getDashboardStats } from '@/components/admin/dashboard/getDashboardStats';
import { DashboardCharts } from '@/components/admin/dashboard/DashboardCharts';

async function DashboardContent() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      label: 'Chiffre d\'affaires',
      value: formatPrice(stats.totalRevenue),
      icon: TrendingUp,
      href: '/admin/orders',
    },
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
    <div className="flex flex-col gap-10">
      {/* Page header */}
      <div>
        <h2 className="font-[family-name:var(--font-newsreader)] text-3xl font-light text-[#1a1510] tracking-tight">
          Dashboard
        </h2>
        <p className="font-[family-name:var(--font-montserrat)] text-sm text-[#B89547]/70 mt-1.5 tracking-wide">
          Vue d&apos;ensemble de la boutique
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="bg-white border border-gray-200/50 shadow-none hover:shadow-md hover:border-[#B89547]/30 transition-all duration-300 cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center justify-center size-9 rounded-full bg-[#B89547]/10">
                    <stat.icon className="size-4 text-[#B89547]" />
                  </div>
                </div>
                <div className="font-[family-name:var(--font-newsreader)] text-3xl text-[#1a1510]">
                  {stat.value}
                </div>
                <div className="font-[family-name:var(--font-montserrat)] text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40 mt-1.5">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts
        ordersByDay={stats.ordersByDay}
        ordersByStatus={stats.ordersByStatus}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <Card className="bg-white border border-gray-200/50 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510]">
                Dernières commandes
              </CardTitle>
              <Link
                href="/admin/orders"
                className="font-[family-name:var(--font-montserrat)] text-xs text-[#B89547] hover:text-[#B89547]/80 transition-colors"
              >
                Voir tout
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="text-sm text-[#1a1510]/30 py-4 text-center">Aucune commande</p>
            ) : (
              <div className="flex flex-col gap-1">
                {stats.recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between rounded-lg p-3 hover:bg-[#FDF5E6] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510] truncate">
                        {order.order_number}
                      </div>
                      <div className="font-[family-name:var(--font-montserrat)] text-xs text-[#1a1510]/40 truncate">
                        {order.customer?.firstName} {order.customer?.lastName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <OrderStatusBadge status={order.status} />
                      <span className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510]">
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
        <Card className="bg-white border border-gray-200/50 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510]">
                Stock bas (&lt; 3)
              </CardTitle>
              <Link
                href="/admin/products"
                className="font-[family-name:var(--font-montserrat)] text-xs text-[#B89547] hover:text-[#B89547]/80 transition-colors"
              >
                Gérer
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.lowStockProducts.length === 0 ? (
              <p className="text-sm text-[#1a1510]/30 py-4 text-center">
                Aucun produit en stock bas
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {stats.lowStockProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/admin/products/${product.id}/edit`}
                    className="flex items-center justify-between rounded-lg p-3 hover:bg-[#FDF5E6] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510] truncate">
                        {product.name}
                      </div>
                      <div className="font-[family-name:var(--font-montserrat)] text-xs text-[#1a1510]/40">
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
    <div className="flex flex-col gap-10">
      <div>
        <div className="h-9 w-40 rounded bg-[#B89547]/10 animate-pulse" />
        <div className="h-4 w-60 rounded bg-[#B89547]/10 animate-pulse mt-2" />
      </div>
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-5">
        {[...Array<undefined>(5)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-[#B89547]/10 animate-pulse" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 rounded-xl bg-[#B89547]/10 animate-pulse" />
        <div className="h-80 rounded-xl bg-[#B89547]/10 animate-pulse" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-xl bg-[#B89547]/10 animate-pulse" />
        <div className="h-64 rounded-xl bg-[#B89547]/10 animate-pulse" />
      </div>
    </div>
  );
}
