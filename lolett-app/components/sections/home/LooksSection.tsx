import { LookCard } from '@/components/look/LookCard';
import type { Look } from '@/types';

interface LooksSectionProps {
  looks: Look[];
}

export function LooksSection({ looks }: LooksSectionProps) {
  return (
    <section className="bg-lolett-blue relative overflow-hidden py-20 sm:py-28 lg:py-36">
      <div className="container">
        {/* Section header */}
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

        {/* Looks grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:gap-10">
          {looks.map((look) => (
            <LookCard key={look.id} look={look} />
          ))}
        </div>
      </div>
    </section>
  );
}
