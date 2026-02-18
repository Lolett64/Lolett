import type { Metadata } from 'next';
import { NouveautesContentV2 } from '@/components/product/NouveautesContentV2';
import { productRepository, lookRepository } from '@/lib/adapters';

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
  const newProducts = await productRepository.findMany({ isNew: true });
  const looks = await lookRepository.findMany();

  const lookProductsEntries = await Promise.all(
    looks.map(async (look: { id: string; productIds: string[] }) => {
      const products = await productRepository.findByIds(look.productIds);
      return [look.id, products] as const;
    })
  );
  const lookProducts = Object.fromEntries(lookProductsEntries);

  return (
    <div className="pt-20 sm:pt-24">
      <NouveautesContentV2
        products={newProducts}
        looks={looks}
        lookProducts={lookProducts}
      />
    </div>
  );
}
