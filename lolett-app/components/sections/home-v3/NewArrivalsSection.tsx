import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { ScrollReveal } from '@/components/editorial/ScrollReveal';
import { Product } from '@/types';

interface NewArrivalsSectionProps {
  products: Product[];
  hexColor?: string;
}

export function NewArrivalsSection({ products, hexColor = '#FFFFFF' }: NewArrivalsSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-24 md:py-32" style={{ backgroundColor: hexColor }}>
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10">

        {/* Editorial header */}
        <ScrollReveal className="mb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8 border-b border-[#1B0B94]/8">
            <div className="flex items-start gap-6">
              <div>
                <span className="text-[#B89547] text-[9px] uppercase tracking-[0.4em] font-semibold mb-4 block">
                  Nouveautés
                </span>
                <h2 className="font-[family-name:var(--font-newsreader)] text-5xl sm:text-6xl lg:text-7xl italic text-[#1B0B94] tracking-tight leading-[0.95]">
                  Fraîchement<br className="hidden sm:block" /> Arrivées
                </h2>
              </div>
            </div>
            <Link
              href="/nouveautes"
              className="group hidden md:inline-flex items-center gap-4 text-[#1B0B94]/60 hover:text-[#B89547] transition-colors duration-500"
            >
              <span className="text-[9px] uppercase tracking-[0.25em] font-medium">Voir toute la sélection</span>
              <span className="w-10 h-px bg-current group-hover:w-16 transition-all duration-500" />
            </Link>
          </div>
        </ScrollReveal>

        {/* Product grid with staggered reveals */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-14 sm:gap-x-8 sm:gap-y-16 lg:grid-cols-4">
          {products.map((product, i) => (
            <ScrollReveal key={product.id} delay={i * 120} distance={50}>
              <div className="group relative">
                {i < 2 && (
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B89547] shadow-[0_0_8px_rgba(184,149,71,0.6)]" />
                    <span className="text-[8px] uppercase tracking-[0.2em] font-semibold text-[#B89547]">New</span>
                  </div>
                )}
                <ProductCard product={product} hideNewBadge priority={i < 4} />
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Mobile link */}
        <ScrollReveal className="mt-14 text-center md:hidden">
          <Link
            href="/shop"
            className="inline-block border border-[#1B0B94] px-10 py-4 text-[10px] uppercase tracking-[0.25em] font-medium text-[#1B0B94] hover:bg-[#1B0B94] hover:text-white transition-all duration-500"
          >
            Voir la suite
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
