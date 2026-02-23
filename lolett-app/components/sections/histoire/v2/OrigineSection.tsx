'use client';

import Image from 'next/image';
import { useParallax } from '@/hooks/useParallax';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface OrigineSectionProps {
  content?: Record<string, string>;
}

export function OrigineSection({ content }: OrigineSectionProps) {
  const { ref, offset } = useParallax(0.15);

  return (
    <section className="relative overflow-hidden bg-[#f3efe8] py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">

          {/* Image parallax */}
          <div ref={ref} className="relative aspect-[3/4] overflow-hidden rounded-2xl">
            <div
              className="absolute inset-0 -top-16 -bottom-16"
              style={{ transform: `translateY(${offset}px)` }}
            >
              <Image
                src="/images/chemise-lin-mediterranee.png"
                alt="Chemise en lin — l'essence de LOLETT"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Texte */}
          <div>
            <ScrollReveal>
              <p className="text-xs font-medium tracking-[0.25em] uppercase text-[#130970]">
                L&apos;Origine
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display mt-5 text-4xl font-bold leading-tight text-[#1a1510] sm:text-5xl">
                {content?.origine_title || "Née dans le Sud-Ouest"}
              </h2>
            </ScrollReveal>

            <ScrollReveal>
              <p className="mt-8 text-lg leading-relaxed text-[#5a4f45]">
                {content?.origine_text || "C'est parti d'une idée simple — on mérite tous d'être bien habillés sans y passer trois heures. Des coupes qui tombent bien, des matières qu'on a envie de toucher, et des prix qui ne font pas grimacer."}
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="mt-8 border-l-2 border-[#1B0B94]/40 pl-6">
                <p className="text-xl italic leading-relaxed text-[#1a1510]">
                  {content?.origine_quote || "\u00AB\u2009Je sélectionne chaque pièce comme si c'était pour moi.\u2009\u00BB"}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <p className="mt-8 text-base leading-relaxed text-[#7a6f63]">
                Ici, pas de tendances éphémères ni de collections à rallonge.
                Juste des pièces qui fonctionnent ensemble, pour que tu sortes
                de chez toi en te disant — ouais, je suis bien là.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
