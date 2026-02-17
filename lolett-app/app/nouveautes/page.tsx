import type { Metadata } from 'next';
import { BrandHeading } from '@/components/brand/BrandHeading';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { getNewProducts } from '@/data/products';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Nouveautés — LOLETT',
  description:
    'Découvrez les dernières pièces LOLETT. Fraîchement débarquées, prêtes à illuminer votre été.',
  alternates: {
    canonical: `${BASE_URL}/nouveautes`,
  },
  openGraph: {
    title: 'Nouveautés — LOLETT',
    description: 'Les dernières pièces de la collection. À peine arrivées, déjà indispensables.',
    url: `${BASE_URL}/nouveautes`,
    type: 'website',
  },
};

export default function NouveautesPage() {
  const newProducts = getNewProducts();

  return (
    <div className="pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="container">
        <Breadcrumbs items={[{ label: 'Nouveautés' }]} />

        <div className="mt-6 mb-8 sm:mt-8 sm:mb-12">
          <span className="text-lolett-blue text-sm font-medium tracking-wider uppercase">
            Fresh arrivals
          </span>
          <BrandHeading as="h1" size="2xl" className="mt-2">
            Fraîchement débarquées
          </BrandHeading>
          <p className="text-lolett-gray-600 mt-4 max-w-[55ch] leading-relaxed">
            Les dernières pièces de la collection. À peine arrivées, déjà indispensables.
          </p>
        </div>

        <ProductGrid products={newProducts} />
      </div>
    </div>
  );
}
