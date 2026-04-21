import type { Metadata } from 'next';
import { NouveautesContentV2 } from '@/components/product/NouveautesContentV2';
import { productRepository, lookRepository } from '@/lib/adapters';
import { getSiteContent } from '@/lib/cms/content';

export const revalidate = 60;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Nouveautés — LOLETT',
  description:
    'Découvrez les dernières pièces LOLETT. Fraîchement débarquées, prêtes à illuminer votre été.',
  alternates: { canonical: `${BASE_URL}/nouveautes` },
  openGraph: {
    title: 'Nouveautés — LOLETT',
    description: 'Les dernières pièces de la collection. À peine arrivées, déjà indispensables.',
    url: `${BASE_URL}/nouveautes`,
    type: 'website',
  },
};

export default async function NouveautesPage() {
  const [newProducts, looks, cms] = await Promise.all([
    productRepository.findMany({ isNew: true }),
    lookRepository.findMany(),
    getSiteContent('nouveautes'),
  ]);

  const lookProductsEntries = await Promise.all(
    looks.map(async (look: { id: string; productIds: string[] }) => {
      const products = await productRepository.findByIds(look.productIds);
      return [look.id, products] as const;
    })
  );
  const lookProducts = Object.fromEntries(lookProductsEntries);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF5E6' }}>
      <NouveautesContentV2
        products={newProducts}
        looks={looks}
        lookProducts={lookProducts}
        heroBadge={cms.badge}
        heroTitle={cms.hero_title}
        heroSubtitle={cms.hero_subtitle}
      />
    </div>
  );
}
