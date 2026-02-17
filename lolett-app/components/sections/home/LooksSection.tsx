import { LookCard } from '@/components/look/LookCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import type { Look } from '@/types';

interface LooksSectionProps {
  looks: Look[];
}

export function LooksSection({ looks }: LooksSectionProps) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36" style={{ background: 'linear-gradient(135deg, #0B0F1A 0%, #111827 50%, #0D1117 100%)' }}>
      <div className="container">
        {/* Section header */}
        <ScrollReveal>
          <div className="mb-12 text-center sm:mb-16 lg:mb-20">
            <span className="text-lolett-yellow text-sm font-medium tracking-wider uppercase">
              Prêt à Sortir
            </span>
            <h2 className="font-display mt-4 text-4xl leading-tight font-bold text-white sm:text-5xl lg:text-6xl">
              Le Look Complet
            </h2>
            <p className="mx-auto mt-6 max-w-[55ch] text-lg text-white/70 sm:text-xl">
              Pas envie de réfléchir ? On a composé des ensembles pour toi. Ajoute tout d&apos;un clic.
            </p>
          </div>
        </ScrollReveal>

        {/* Looks grid — staggered */}
        <ScrollReveal stagger>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:gap-10">
            {looks.map((look) => (
              <LookCard key={look.id} look={look} />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
