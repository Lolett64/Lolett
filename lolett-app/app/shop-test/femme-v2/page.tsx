import type { Metadata } from 'next';
import { ShopContentV2 } from '@/components/product/ShopContentV2';
import { productRepository, categoryRepository } from '@/lib/adapters';

export const metadata: Metadata = {
  title: 'Shop Femme V2 — LOLETT Test',
};

export default async function ShopFemmeV2Page() {
  const products = await productRepository.findMany({ gender: 'femme' });
  const categories = await categoryRepository.findByGender('femme');

  return (
    <div className="pt-20 sm:pt-24">
      <ShopContentV2
        gender="femme"
        products={products}
        categories={categories}
        heroImage="https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1600&q=80"
        heroTitle="Collection Femme"
        heroSubtitle="Robes fluides, tops en lin. L'art de vivre à la méditerranéenne."
      />
    </div>
  );
}
