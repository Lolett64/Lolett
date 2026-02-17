import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import type { Product } from '@/types';

interface NewArrivalsSectionProps {
  products: Product[];
}

export function NewArrivalsSection({ products }: NewArrivalsSectionProps) {
  return (
    <section className="noise bg-lolett-cream relative overflow-hidden py-20 sm:py-28 lg:py-36">
      <div className="container">
        {/* Section header */}
        <ScrollReveal>
          <div className="mb-12 flex flex-col gap-6 sm:mb-16 lg:mb-20 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full min-w-0 lg:w-auto">
              <span className="text-lolett-blue text-sm font-medium tracking-wider uppercase">
                Nouveautés
              </span>
              <h2 className="font-display text-lolett-gray-900 mt-4 text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl">
                Fraîchement Arrivées
              </h2>
            </div>
            <Link
              href="/nouveautes"
              className="text-lolett-blue inline-flex flex-shrink-0 items-center gap-3 font-medium transition-all hover:gap-4"
            >
              <span>Voir la collection</span>
              <ArrowRight className="h-5 w-5 flex-shrink-0" />
            </Link>
          </div>
        </ScrollReveal>

        {/* Products grid — staggered reveal */}
        <ScrollReveal stagger>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
