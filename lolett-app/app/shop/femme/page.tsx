import type { Metadata } from 'next';
import { ShopContentV4 } from '@/components/product/ShopContentV4';
import { productRepository, categoryRepository } from '@/lib/adapters';

export const revalidate = 60;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Sélection Femme — LOLETT',
  description:
    'Découvrez la sélection femme LOLETT. Robes fluides, tops en lin, accessoires solaires — l\'art de vivre à la mode du Sud-Ouest. Livraison offerte dès 100 €.',
  alternates: { canonical: `${BASE_URL}/shop/femme` },
  openGraph: {
    title: 'Sélection Femme — LOLETT',
    description: 'Robes fluides, tops en lin. L\'art de vivre à la mode du Sud-Ouest.',
    url: `${BASE_URL}/shop/femme`,
    type: 'website',
  },
};

export default async function ShopFemmePage() {
  const products = await productRepository.findMany({ gender: 'femme' });
  const categories = await categoryRepository.findByGender('femme');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF5E6' }}>
      <ShopContentV4
        gender="femme"
        products={products}
        categories={categories}
        heroImage="https://plus.unsplash.com/premium_photo-1683141076955-bddd5efbb03c?w=1600&q=80"
        heroImagePosition="50% 50%"
        heroHeight="h-[35vh] min-h-[300px]"
        heroTitle="Collection Femme"
        heroSubtitle="Robes fluides, tops en lin. L'art de vivre à la mode du Sud-Ouest."
      />
    </div>
  );
}
