import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Package } from 'lucide-react';
import { formatPrice } from '@/lib/admin/utils';
import { ProductDeleteButton } from '@/components/admin/ProductDeleteButton';
import { ProductStockInput } from '@/components/admin/ProductStockInput';
import { ProductNewToggle } from '@/components/admin/ProductNewToggle';

export interface Product {
  id: string;
  name: string;
  slug: string;
  gender: string;
  category_slug: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  is_new: boolean;
  images: string[];
  created_at: string;
}

export const TH =
  'text-left px-4 py-3 font-[family-name:var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-wider text-[#1a1510]/50';

export function ProductRow({ product }: { product: Product }) {
  return (
    <tr className="hover:bg-[#FDF5E6] transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="size-10 rounded-lg object-cover shrink-0 border border-gray-200/50"
            />
          ) : (
            <div className="size-10 rounded-lg bg-[#FDF5E6] border border-gray-200/50 flex items-center justify-center shrink-0">
              <Package className="size-4 text-[#B89547]/40" />
            </div>
          )}
          <div className="min-w-0">
            <div className="font-[family-name:var(--font-montserrat)] font-medium text-[#1a1510] truncate">
              {product.name}
            </div>
            <div className="font-[family-name:var(--font-montserrat)] text-xs text-[#1a1510]/40 truncate">
              {product.slug}
            </div>
          </div>
          <ProductNewToggle productId={product.id} initialIsNew={product.is_new} />
        </div>
      </td>
      <td className="px-4 py-3 text-right font-[family-name:var(--font-montserrat)] font-medium">
        {product.compare_at_price && product.compare_at_price > product.price ? (
          <div>
            <span className="line-through text-[#999] text-xs mr-1">{formatPrice(product.compare_at_price)}</span>
            <span className="text-red-600 font-semibold">{formatPrice(product.price)}</span>
            <span className="ml-1 text-[10px] font-bold text-red-600 bg-red-50 rounded px-1 py-0.5">
              -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
            </span>
          </div>
        ) : (
          <span className="text-[#1a1510]">{formatPrice(product.price)}</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        <ProductStockInput productId={product.id} initialStock={product.stock} />
      </td>
      <td className="px-4 py-3 text-center hidden sm:table-cell">
        {product.stock === 0 ? (
          <Badge variant="destructive" className="text-xs">
            Epuise
          </Badge>
        ) : product.stock < 3 ? (
          <Badge variant="outline" className="border-orange-400 text-orange-600 text-xs">
            Stock bas
          </Badge>
        ) : (
          <Badge variant="outline" className="border-green-400 text-green-600 text-xs">
            En stock
          </Badge>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Link href={`/admin/products/${product.id}/edit`}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 h-8 px-2 text-[#1a1510]/60 hover:text-[#B89547]"
            >
              <Pencil className="size-3.5" />
              <span className="hidden lg:inline">Editer</span>
            </Button>
          </Link>
          <ProductDeleteButton productId={product.id} productName={product.name} />
        </div>
      </td>
    </tr>
  );
}
