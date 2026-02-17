import { Suspense } from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil } from 'lucide-react';
import { formatPrice } from '@/lib/admin/utils';
import { ProductDeleteButton } from '@/components/admin/ProductDeleteButton';
import { ProductStockInput } from '@/components/admin/ProductStockInput';
import { ProductFilters } from '@/components/admin/ProductFilters';

interface SearchParams {
  gender?: string;
  category?: string;
  search?: string;
  sort?: string;
  order?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  gender: string;
  category_slug: string;
  price: number;
  stock: number;
  is_new: boolean;
  images: string[];
  created_at: string;
}

async function getProducts(params: SearchParams): Promise<Product[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from('products')
    .select('id, name, slug, gender, category_slug, price, stock, is_new, images, created_at');

  if (params.gender) query = query.eq('gender', params.gender);
  if (params.category) query = query.eq('category_slug', params.category);
  if (params.search) query = query.ilike('name', `%${params.search}%`);

  const validSortFields = ['created_at', 'price', 'stock', 'name'];
  const sortField = validSortFields.includes(params.sort ?? '') ? params.sort! : 'created_at';
  query = query.order(sortField, { ascending: params.order === 'asc' });

  const { data } = await query;
  return (data ?? []) as Product[];
}

async function ProductsContent({ searchParams }: { searchParams: SearchParams }) {
  const products = await getProducts(searchParams);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-lolett-gray-900">Produits</h2>
          <p className="text-sm text-lolett-gray-500 mt-1">{products.length} produit(s)</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            Nouveau produit
          </Button>
        </Link>
      </div>

      <ProductFilters />

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-lolett-gray-300 p-12 text-center">
          <p className="text-lolett-gray-400">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="rounded-xl border border-lolett-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-lolett-gray-200 bg-lolett-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-lolett-gray-600">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-lolett-gray-600 hidden md:table-cell">Genre</th>
                  <th className="text-left px-4 py-3 font-medium text-lolett-gray-600 hidden lg:table-cell">Catégorie</th>
                  <th className="text-right px-4 py-3 font-medium text-lolett-gray-600">Prix</th>
                  <th className="text-center px-4 py-3 font-medium text-lolett-gray-600">Stock</th>
                  <th className="text-center px-4 py-3 font-medium text-lolett-gray-600 hidden sm:table-cell">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-lolett-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lolett-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-lolett-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="size-10 rounded-lg object-cover shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-lolett-gray-900 truncate">{product.name}</div>
                          <div className="text-xs text-lolett-gray-400 truncate">{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell capitalize text-lolett-gray-600">
                      {product.gender}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-lolett-gray-600">
                      {product.category_slug}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ProductStockInput productId={product.id} initialStock={product.stock} />
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      {product.stock === 0 ? (
                        <Badge variant="destructive" className="text-xs">Épuisé</Badge>
                      ) : product.stock < 3 ? (
                        <Badge variant="outline" className="border-orange-400 text-orange-600 text-xs">Stock bas</Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-400 text-green-600 text-xs">En stock</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button variant="ghost" size="sm" className="gap-1 h-8 px-2">
                            <Pencil className="size-3.5" />
                            <span className="hidden lg:inline">Éditer</span>
                          </Button>
                        </Link>
                        <ProductDeleteButton productId={product.id} productName={product.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<TableSkeleton />}>
      <ProductsContent searchParams={params} />
    </Suspense>
  );
}

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-10 w-48 rounded bg-lolett-gray-200 animate-pulse" />
      <div className="h-48 rounded-xl bg-lolett-gray-200 animate-pulse" />
    </div>
  );
}
