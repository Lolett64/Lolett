import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/editorial/ScrollReveal';
import { Look, Product } from '@/types';
import { ArrowUpRight } from 'lucide-react';

interface LooksSectionProps {
  looks: Look[];
  lookProducts?: Record<string, Product[]>;
  hexColor?: string;
}

export function LooksSection({ looks, lookProducts = {}, hexColor = '#FFFFFF' }: LooksSectionProps) {
  if (!looks || looks.length === 0) return null;

  return (
    <section
      className="py-16 md:py-20 border-b border-[#1B0B94]/10"
      style={{ backgroundColor: hexColor }}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">

        <div className="text-center mb-12 md:mb-16">
          <span className="text-[#B89547] text-[10px] uppercase tracking-[0.3em] font-medium mb-4 block">
            Prêt à sortir
          </span>
          <h2 className="font-[family-name:var(--font-newsreader)] text-5xl md:text-6xl italic text-[#1B0B94]">
            Le Look Complet
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {looks.slice(0, 3).map((look, i) => {
            const products = lookProducts[look.id] || [];

            return (
              <ScrollReveal key={look.id} delay={i * 150} className={`flex flex-col group ${i === 1 ? 'md:mt-12 lg:mt-16' : ''} ${i === 2 ? 'lg:mt-8' : ''}`}>

                {/* Image du Look (Style Encadré Héritage) - Sans gris */}
                <Link
                  href={`/looks/${look.id}`}
                  className="block relative aspect-[3/4] overflow-hidden border-[0.5px] border-[#1B0B94]/10 p-2 md:p-3 mb-8 shadow-sm group-hover:shadow-md transition-shadow duration-500"
                  style={{ backgroundColor: `${hexColor}` }}
                >
                  <div className="relative w-full h-full overflow-hidden">
                    <Image
                      src={look.coverImage}
                      alt={look.title}
                      fill
                      className="object-cover sepia-[0.15] opacity-90 transition-transform duration-[2s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#F3EFEA] via-[#F3EFEA]/20 to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-500" />

                    {/* UX : Bouton recouvrant CTA clair */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="bg-[#1B0B94] text-[#F3EFEA] px-6 py-3 text-[9px] uppercase tracking-[0.2em] font-medium shadow-xl">
                        Voir la tenue complète
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="text-center mb-6 border-b border-[#1B0B94]/10 pb-6">
                  <h3 className="font-[family-name:var(--font-newsreader)] text-3xl italic text-[#1B0B94]">{look.title}</h3>
                  <p className="text-[#1B0B94]/60 text-xs mt-3 font-light leading-relaxed max-w-sm mx-auto">{look.shortPitch}</p>
                </div>

                {/* UX Recommandation : Les pièces associées (Shop the look en miniature) */}
                <div className="flex flex-col gap-3 px-4">
                  <span className="text-[#B89547] text-[8px] uppercase tracking-[0.3em] font-bold text-center mb-2">Les Pièces du Look</span>
                  {products.slice(0, 2).map((prod) => (
                    <Link href={`/product/detail`} key={prod.id} className="flex items-center gap-4 group/item hover:bg-[#1B0B94]/5 p-2 transition-colors border border-transparent hover:border-[#1B0B94]/5">
                      <div className="relative w-12 h-16 bg-white overflow-hidden border border-[#1B0B94]/10 shrink-0">
                        <Image src={prod.images[0] || '/placeholder.png'} alt={prod.name} fill className="object-cover sepia-[0.1]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-[family-name:var(--font-newsreader)] text-[#1B0B94] text-lg italic truncate">{prod.name}</h4>
                        <span className="text-[#1B0B94]/50 text-[10px] uppercase font-medium">{prod.price} €</span>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-[#1B0B94]/10 flex items-center justify-center text-[#1B0B94]/40 group-hover/item:bg-[#1B0B94] group-hover/item:text-white group-hover/item:border-[#1B0B94] transition-all">
                        <ArrowUpRight size={14} />
                      </div>
                    </Link>
                  ))}
                </div>

              </ScrollReveal>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <Link href="/looks" className="text-[#1B0B94] text-[10px] uppercase tracking-[0.2em] font-medium border-b border-[#1B0B94]/30 pb-1 hover:border-[#B89547] hover:text-[#B89547] transition-all">
            Tous les vestiaires
          </Link>
        </div>

      </div>
    </section>
  );
}
