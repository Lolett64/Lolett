import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types';

interface NewArrivalsSectionProps {
  products: Product[];
  hexColor?: string;
}

export function NewArrivalsSection({ products, hexColor = '#FFFFFF' }: NewArrivalsSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section
      className="py-20 border-b border-[#1B0B94]/10"
      style={{ backgroundColor: hexColor }}
    >
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8">

        {/* En-tête de section Éditoriale */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-[#1B0B94]/10 pb-6 gap-6">
          <div>
            <span className="text-[#B89547] text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">
              Derniers Rayons
            </span>
            <h2 className="font-[family-name:var(--font-newsreader)] text-5xl sm:text-7xl italic text-[#1B0B94] tracking-tight">
              Nouveautés Atelier
            </h2>
          </div>
          <Link
            href="/shop/nouveautes"
            className="group hidden sm:inline-flex items-center gap-3 text-[#1B0B94] text-[9px] uppercase tracking-[0.2em] font-medium hover:text-[#B89547] transition-colors"
          >
            Voir toute la sélection
            <span className="w-8 h-px bg-[#1B0B94]/30 group-hover:bg-[#B89547] group-hover:w-12 transition-all duration-300" />
          </Link>
        </div>

        {/* Grille de produits */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4">
          {products.map((product, i) => (
            <div key={product.id} className="group relative">
              {/* UX Recommandation : Intégration subtile d'un badge "Nouveau" ou "Édition Limitée" */}
              {i < 2 && (
                <div className="absolute top-4 left-4 z-10 w-2 h-2 rounded-full bg-[#B89547] shadow-[0_0_10px_rgba(184,149,71,0.5)] animate-pulse" title="Nouveau" />
              )}
              <div className="relative">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </div>

        {/* Lien Mobile */}
        <div className="mt-12 text-center sm:hidden">
          <Link
            href="/shop"
            className="inline-block border border-[#1B0B94] px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-medium text-[#1B0B94] hover:bg-[#1B0B94] hover:text-[#F3EFEA] transition-colors"
          >
            Voir la suite
          </Link>
        </div>
      </div>
    </section>
  );
}
