import type { Metadata } from 'next';
import { ShopContentV2 } from '@/components/product/ShopContentV2';
import { productRepository, categoryRepository } from '@/lib/adapters';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Sélection Femme — LOLETT',
  description:
    'Découvrez la sélection femme LOLETT. Robes fluides, tops en lin, accessoires solaires — l\'art de vivre à la méditerranéenne. Livraison offerte dès 100 €.',
  alternates: { canonical: `${BASE_URL}/shop/femme` },
  openGraph: {
    title: 'Sélection Femme — LOLETT',
    description: 'Robes fluides, tops en lin. L\'art de vivre à la méditerranéenne.',
    url: `${BASE_URL}/shop/femme`,
    type: 'website',
  },
};

export default async function ShopFemmePage() {
  const products = await productRepository.findMany({ gender: 'femme' });
  const categories = await categoryRepository.findByGender('femme');

  return (
    <div className="pt-20 sm:pt-24">
      <ShopContentV2
        gender="femme"
        products={products}
        categories={categories}
        heroImage="https://plus.unsplash.com/premium_photo-1683141076955-bddd5efbb03c?w=1600&q=80"
        heroTitle="Collection Femme"
        heroSubtitle="Robes fluides, tops en lin. L'art de vivre à la méditerranéenne."
      />
    </div>
  );
}
