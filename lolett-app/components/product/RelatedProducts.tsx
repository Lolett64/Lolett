import type { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16 sm:mt-24">
      <div className="mb-8 flex items-center gap-4">
        <div className="h-px flex-1" style={{ background: 'rgba(27,11,148,0.2)' }} />
        <h2 className="font-display text-xl font-bold whitespace-nowrap sm:text-2xl" style={{ color: '#1a1510' }}>
          Vous aimerez aussi
        </h2>
        <div className="h-px flex-1" style={{ background: 'rgba(27,11,148,0.2)' }} />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
