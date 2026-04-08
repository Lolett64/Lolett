import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/editorial/ScrollReveal';

interface BrandStorySectionProps {
  content?: Record<string, string>;
  hexColor?: string;
}

export function BrandStorySection({ content, hexColor = '#FFFFFF' }: BrandStorySectionProps) {
  const ctaText = content?.cta_text || 'Découvrir la Maison';
  const ctaHref = content?.cta_href || '/notre-histoire';

  return (
    <section className="relative py-24 md:py-36 overflow-hidden" style={{ backgroundColor: hexColor }}>
      <div className="max-w-[1300px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Photo */}
          <ScrollReveal className="relative">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm shadow-[0_20px_80px_rgba(27,11,148,0.10)]">
              <Image
                src="/images/fondatrice.jpg"
                alt="Lola, fondatrice de LOLETT"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 90vw, 45vw"
              />
            </div>
            {/* Label flottant */}
            <div className="absolute -bottom-5 -right-4 md:-right-8 bg-[#1B0B94] text-white px-6 py-4">
              <p className="text-[9px] uppercase tracking-[0.35em] font-semibold text-[#B89547] mb-1">Fondatrice</p>
              <p className="font-[family-name:var(--font-newsreader)] text-xl italic">Lolett</p>
            </div>
          </ScrollReveal>

          {/* Texte */}
          <div className="flex flex-col justify-center">
            <ScrollReveal>
              <div className="flex items-center gap-4 mb-8">
                <span className="w-8 h-px bg-[#B89547]/60" />
                <span className="text-[#B89547] text-[9px] uppercase tracking-[0.5em] font-semibold">Mon histoire</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h2 className="font-[family-name:var(--font-newsreader)] text-4xl md:text-5xl lg:text-[3.2rem] text-[#1B0B94] leading-[1.1] tracking-tight mb-8">
                "Je sélectionne chaque pièce comme si c'était pour moi"
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="w-8 h-px bg-[#B89547]/50 mb-8" />
              <p className="text-sm md:text-base leading-[1.9] text-[#1B0B94]/65 mb-4 font-[family-name:var(--font-montserrat)]">
                LOLETT est née d'une envie simple : proposer des pièces que j'aurais moi-même envie de porter. Des matières que l'on sent, des coupes qui restent — sans jamais sacrifier le confort au style.
              </p>
              <p className="text-sm md:text-base leading-[1.9] text-[#1B0B94]/65 font-[family-name:var(--font-montserrat)]">
                Chaque sélection est pensée depuis le Sud-Ouest, avec cette idée que s'habiller, c'est s'exprimer — pas impressionner.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={350} className="mt-10">
              <Link
                href={ctaHref}
                className="group inline-flex items-center gap-4 border border-[#1B0B94] px-10 py-4 text-[11px] uppercase tracking-[0.3em] font-bold text-[#1B0B94] hover:bg-[#1B0B94] hover:text-white transition-all duration-700"
              >
                {ctaText}
                <span className="w-5 h-px bg-current group-hover:w-8 transition-all duration-500" />
              </Link>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
}
