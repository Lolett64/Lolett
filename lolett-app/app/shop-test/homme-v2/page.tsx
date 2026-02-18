import type { Metadata } from 'next';
import { ShopContentV2 } from '@/components/product/ShopContentV2';
import { productRepository, categoryRepository } from '@/lib/adapters';

export const metadata: Metadata = {
  title: 'Shop Homme V2 — LOLETT Test',
};

export default async function ShopHommeV2Page() {
  const products = await productRepository.findMany({ gender: 'homme' });
  const categories = await categoryRepository.findByGender('homme');

  return (
    <div className="pt-20 sm:pt-24">
      <ShopContentV2
        gender="homme"
        products={products}
        categories={categories}
        heroImage="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1600&q=80"
        heroTitle="Collection Homme"
        heroSubtitle="Lin léger, coton premium. Tout ce qu'il faut pour un été au Sud."
      />
    </div>
  );
}
