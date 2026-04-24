import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getLowStockVariants, getOutOfStockVariants } from '@/lib/admin/low-stock';
import { STOCK } from '@/lib/constants';

/**
 * Widget serveur (RSC) : affiche les variantes en stock bas ou rupture
 * directement depuis la table `product_variants`.
 * Deux sections : rupture (stock=0) puis stock bas (0 < stock < LOW_THRESHOLD).
 */
export async function LowStockWidget() {
  const [outOfStock, lowStock] = await Promise.all([
    getOutOfStockVariants({ limit: 10 }),
    getLowStockVariants({ limit: 10 }),
  ]);

  const hasContent = outOfStock.length > 0 || lowStock.length > 0;

  return (
    <Card className="bg-white border border-gray-200/50 shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510]">
            Variantes à réassortir
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
        {!hasContent ? (
          <p className="text-sm text-[#1a1510]/30 py-4 text-center">
            Toutes les variantes sont en stock
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {outOfStock.length > 0 && (
              <div>
                <div className="font-[family-name:var(--font-montserrat)] text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40 mb-2 px-1">
                  Rupture ({outOfStock.length})
                </div>
                <div className="flex flex-col gap-1">
                  {outOfStock.map((v) => (
                    <Link
                      key={v.id}
                      href={`/admin/products/${v.productId}/edit`}
                      className="flex items-center justify-between rounded-lg p-3 hover:bg-[#FDF5E6] transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510] truncate">
                          {v.productName}
                        </div>
                        <div className="font-[family-name:var(--font-montserrat)] text-xs text-[#1a1510]/40 truncate">
                          {v.colorName} · taille {v.size}
                        </div>
                      </div>
                      <Badge variant="destructive" className="shrink-0 ml-2">
                        Épuisé
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {lowStock.length > 0 && (
              <div>
                <div className="font-[family-name:var(--font-montserrat)] text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40 mb-2 px-1">
                  Stock bas (&lt; {STOCK.LOW_THRESHOLD}) — {lowStock.length}
                </div>
                <div className="flex flex-col gap-1">
                  {lowStock.map((v) => (
                    <Link
                      key={v.id}
                      href={`/admin/products/${v.productId}/edit`}
                      className="flex items-center justify-between rounded-lg p-3 hover:bg-[#FDF5E6] transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510] truncate">
                          {v.productName}
                        </div>
                        <div className="font-[family-name:var(--font-montserrat)] text-xs text-[#1a1510]/40 truncate">
                          {v.colorName} · taille {v.size}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 ml-2 border-orange-400 text-orange-600"
                      >
                        Stock : {v.stock}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function LowStockWidgetSkeleton() {
  return (
    <div className="h-64 rounded-xl bg-[#B89547]/10 animate-pulse" />
  );
}
