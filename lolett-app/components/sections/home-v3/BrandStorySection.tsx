import Link from 'next/link';
import { ScrollReveal } from '@/components/editorial/ScrollReveal';
import { Leaf, Scissors, Clock } from 'lucide-react';

interface BrandStorySectionProps {
  content?: Record<string, string>;
  hexColor?: string;
}

export function BrandStorySection({ hexColor = '#FFFFFF' }: BrandStorySectionProps) {
  return (
    <section
      className="py-8 md:py-10 border-b border-[#1B0B94]/10 relative overflow-hidden"
      style={{ backgroundColor: hexColor }}
    >

      {/* Le Manifeste - Typographie Géante sans bordure parasite */}

      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative z-10">

        {/* Le Manifeste - Typographie Géante */}
        <ScrollReveal className="text-center mb-6">
          <div className="w-px h-8 bg-[#1B0B94]/30 mx-auto mb-6" />
          <span className="text-[#B89547] text-[10px] uppercase tracking-[0.3em] font-medium mb-6 block">Le Manifeste Maison</span>

          <h2 className="font-[family-name:var(--font-newsreader)] text-4xl sm:text-7xl lg:text-[6rem] text-[#1B0B94] leading-[0.9] max-w-[1400px] mx-auto text-balance tracking-tighter">
            Une silhouette <span className="italic">impalpable</span>,<br /> dictée par la brise.
          </h2>

          <div className="w-px h-8 bg-[#1B0B94]/30 mx-auto mt-6 mb-8" />

          <p className="font-[family-name:var(--font-newsreader)] text-2xl md:text-3xl leading-relaxed text-[#1B0B94]/80 max-w-[1100px] mx-auto italic tracking-tight">
            {`"Chez Lorett, le vêtement ne contraint jamais. Il accompagne le mouvement, reflète la lumière du bassin et vieillit avec la grâce des matières naturelles. Nos racines s'ancrent profondément dans le sable chaud de la côte Atlantique."`}
          </p>
        </ScrollReveal>

        {/* UX Recommandation : Les 3 icônes de réassurance "Savoir-Faire" */}
        <ScrollReveal delay={200} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6 pt-6 border-t border-[#1B0B94]/20">
          <div className="flex flex-col items-center text-center">
            <Leaf strokeWidth={1} className="w-10 h-10 text-[#B89547] mb-6" />
            <h3 className="text-xs md:text-sm uppercase tracking-[0.25em] font-bold text-[#1B0B94] mb-4">Matières Nobles</h3>
            <p className="text-sm text-[#1B0B94]/80 max-w-[300px] font-medium leading-relaxed">
              Lin pur, coton biologique et fibres naturelles sélectionnées pour leur tombé parfait.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <Scissors strokeWidth={1} className="w-10 h-10 text-[#B89547] mb-6" />
            <h3 className="text-xs md:text-sm uppercase tracking-[0.25em] font-bold text-[#1B0B94] mb-4">Coupe Parfaite</h3>
            <p className="text-sm text-[#1B0B94]/80 max-w-[300px] font-medium leading-relaxed">
              Prototypage exclusif dans nos ateliers de Bordeaux. Une architecture du vêtement sans compromis.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <Clock strokeWidth={1} className="w-10 h-10 text-[#B89547] mb-6" />
            <h3 className="text-xs md:text-sm uppercase tracking-[0.25em] font-bold text-[#1B0B94] mb-4">Conçu pour Durer</h3>
            <p className="text-sm text-[#1B0B94]/80 max-w-[300px] font-medium leading-relaxed">
              Un vestiaire intemporel qui se patine avec le temps. Loin de toute obsolescence.
            </p>
          </div>
        </ScrollReveal>

        <div className="text-center mt-10">
          <Link href="/histoire" className="inline-flex items-center justify-center border border-[#1B0B94] px-12 py-5 text-sm uppercase tracking-[0.25em] font-bold text-[#1B0B94] hover:bg-[#1B0B94] hover:text-white transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1">
            Découvrir la Maison
          </Link>
        </div>

      </div>
    </section>
  );
}
