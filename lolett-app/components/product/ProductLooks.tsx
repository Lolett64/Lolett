import type { Look } from '@/types';
import { BrandHeading } from '@/components/brand/BrandHeading';
import { LookCard } from '@/components/look/LookCard';

interface ProductLooksProps {
  looks: Look[];
}

export function ProductLooks({ looks }: ProductLooksProps) {
  return (
    <section className="border-lolett-gray-200 mt-12 border-t pt-10 sm:mt-20 sm:pt-16">
      <div className="mb-8 text-center sm:mb-12">
        <span className="text-lolett-blue text-sm font-medium tracking-wider uppercase">
          Prêt à sortir
        </span>
        <BrandHeading as="h2" size="lg" className="mt-2">
          Complete le look
        </BrandHeading>
        <p className="text-lolett-gray-600 mx-auto mt-3 max-w-[55ch] text-sm sm:text-base">
          Ce produit fait partie de {looks.length > 1 ? 'ces looks' : 'ce look'}. Ajoute tout d&apos;un
          clic.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
        {looks.slice(0, 3).map((look) => (
          <LookCard key={look.id} look={look} />
        ))}
      </div>
    </section>
  );
}
