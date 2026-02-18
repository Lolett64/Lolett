import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { HeroProductPanel } from '@/components/product/HeroProductPanel';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import type { Product } from '@/types';

interface NewArrivalsSectionV2Props {
  products: Product[];
}

export function NewArrivalsSectionV2({ products }: NewArrivalsSectionV2Props) {
  if (!products || products.length === 0) return null;

  const heroes = products.slice(0, 2);
  const secondary = products.slice(2, 4);

  return (
    <section
      className="relative overflow-hidden pt-20 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20"
      style={{ background: 'radial-gradient(circle at top left, #fbe9d2 0%, #fefaf4 45%, #f8efe3 100%)' }}
    >
      {/* Formes décoratives principales – plus affirmées mais limitées */}
      <div className="pointer-events-none absolute inset-0">
        {/* Grande tache solaire */}
        <div
          className="absolute -top-32 -right-24 h-80 w-80 rounded-[999px] blur-3xl opacity-60"
          style={{
            background:
              'conic-gradient(from 220deg at 50% 50%, rgba(255,193,120,0.9), rgba(210,150,90,0.85), rgba(255,215,160,0.95))',
          }}
        />

        {/* Bloc terracotta décalé derrière la grille */}
        <div
          className="absolute bottom-[-20%] left-[-10%] h-[65%] w-[55%] rotate-[-4deg]"
          style={{
            background: 'linear-gradient(135deg, #d2906a 0%, #b56a4b 40%, #8e4b37 100%)',
            opacity: 0.12,
          }}
        />

        {/* Encadrement éditorial discret */}
        <div className="absolute inset-x-8 top-10 hidden h-[82%] border border-dashed border-[#c9a17b33] sm:block" />
      </div>

      <div className="container relative">
        {/* Bandeau éditorial titre + CTA */}
        <ScrollReveal>
          <div className="mb-12 sm:mb-14 lg:mb-16">
            <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#9a6a3b]">
              Fresh arrivals
            </span>
            <h2
              className="font-display mt-3 text-[2.4rem] leading-[1.05] font-bold tracking-tight sm:text-[2.9rem] lg:text-[3.2rem]"
              style={{ color: '#23130c' }}
            >
              Fraîchement arrivées,
              <span className="block text-[2.15rem] font-normal italic tracking-[0.04em] text-[#8e5d37] sm:text-[2.4rem]">
                pensées comme une capsule solaire.
              </span>
            </h2>
            <p
              className="mt-4 max-w-2xl text-[0.9rem] leading-relaxed text-[#6b5541] sm:text-[0.95rem]"
              style={{ letterSpacing: '0.03em' }}
            >
              Pièces en série courte, volumes légers, teintes dorées. Une sélection resserrée,
              choisie comme on prépare une valise pour le Sud.
            </p>
            <Link
              href="/nouveautes"
              className="mt-6 inline-flex items-center gap-3 rounded-full border border-[#b98455] bg-[#fef7ef] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#6f4525] shadow-[0_12px_30px_rgba(107,72,47,0.16)] transition-all duration-500 hover:-translate-y-0.5 hover:border-[#8d5b33] hover:bg-[#fbe7d1] hover:shadow-[0_20px_40px_rgba(90,58,36,0.28)] sm:text-[0.72rem]"
            >
              <span>Voir toutes les nouveautés</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#b98455] text-[#fdf3e4]">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </ScrollReveal>

        {/* Grille éditoriale : 2 pièces phares côte à côte (image | texte + tailles) + capsule dessous */}
        <ScrollReveal stagger>
          {/* Row 1 — 2 pièces phares côte à côte */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {heroes.map((product, i) => (
              <div
                key={product.id}
                className="relative overflow-hidden rounded-2xl bg-[#f7eee4]/80 p-2.5 shadow-[0_20px_60px_rgba(48,29,16,0.14)] sm:p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2 px-1">
                  <p className="text-[0.6rem] uppercase tracking-[0.2em] text-[#9d6f44]">
                    {i === 0 ? 'Pièce phare' : 'Coup de cœur'}
                  </p>
                  <div className="shrink-0 rounded-full bg-[#23130c] px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.15em] text-[#fbe7d0]">
                    {product.price} €
                  </div>
                </div>

                <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-3 sm:items-stretch">
                  {/* Gauche — image produit */}
                  <ProductCard product={product} />

                  {/* Droite — présentation + tailles + ajouter au panier */}
                  <HeroProductPanel
                    product={product}
                    tagline={i === 0 ? 'Lin, soleil, mouvement' : 'Style & confort'}
                    description={
                      i === 0
                        ? "Coupe pensée pour suivre la lumière, tomber juste et laisser la peau respirer."
                        : "Pièce du quotidien au soleil. Matière douce, coupe moderne, allure décontractée."
                    }
                    composition={i === 0 ? '70% lin, 30% coton' : '100% coton'}
                    tags={i === 0 ? ['Série courte', 'Lin-coton'] : ['Série courte', 'Coton doux']}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Row 2 — Capsule du moment */}
          <div className="mt-8">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <p className="text-[0.8rem] uppercase tracking-[0.18em] text-[#7e5a39]">
                Le reste de la capsule
              </p>
              <p className="text-[0.75rem] text-[#8f745a]">
                {products.length} pièces —{' '}
                <span className="font-medium text-[#5b4029]">quantité limitée</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {secondary.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl bg-[#f7ebde]/90 p-1.5 shadow-[0_16px_40px_rgba(74,46,27,0.16)] transition-transform duration-500 ease-out hover:-translate-y-1"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3 text-[0.8rem] text-[#7b5c3c]">
              <span className="inline-flex h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#c89a73] to-transparent" />
              <span className="whitespace-nowrap tracking-[0.18em] uppercase">
                Capsule du moment
              </span>
              <span className="inline-flex h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#c89a73] to-transparent" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

