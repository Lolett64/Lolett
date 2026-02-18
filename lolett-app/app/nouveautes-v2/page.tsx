import type { Metadata } from 'next';
import { NouveautesContentV2 } from '@/components/product/NouveautesContentV2';
import { productRepository, lookRepository } from '@/lib/adapters';

export const metadata: Metadata = {
  title: 'Nouveautés V2 — LOLETT',
  description: 'Découvrez les dernières pièces LOLETT. Lookbook magazine avec looks et nouveautés.',
};

export default async function NouveautesV2Page() {
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
