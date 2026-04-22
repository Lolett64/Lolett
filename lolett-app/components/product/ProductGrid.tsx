import type { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  hideNewBadge?: boolean;
}

export function ProductGrid({ products, columns = 4, hideNewBadge }: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 sm:gap-6 lg:gap-8`}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          hideNewBadge={hideNewBadge}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
