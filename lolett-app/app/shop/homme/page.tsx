import type { Metadata } from 'next';
import { ShopContentV2 } from '@/components/product/ShopContentV2';
import { productRepository, categoryRepository } from '@/lib/adapters';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Sélection Homme — LOLETT',
  description:
    'Découvrez la sélection homme LOLETT. Lin léger, coton premium, looks complets pensés pour le Sud. Livraison offerte dès 100 €.',
  alternates: { canonical: `${BASE_URL}/shop/homme` },
  openGraph: {
    title: 'Sélection Homme — LOLETT',
    description: 'Lin léger, coton premium. Tout ce qu\'il faut pour un été au Sud.',
    url: `${BASE_URL}/shop/homme`,
    type: 'website',
  },
};

export default async function ShopHommePage() {
  const products = await productRepository.findMany({ gender: 'homme' });
  const categories = await categoryRepository.findByGender('homme');

  return (
    <div className="pt-20 sm:pt-24">
      <ShopContentV2
        gender="homme"
        products={products}
        categories={categories}
        heroImage="https://images.unsplash.com/photo-1771148885935-c57afa2726bc?w=1600&q=80"
        heroImagePosition="center 65%"
        heroTitle="Collection Homme"
        heroSubtitle="Lin léger, coton premium. Tout ce qu'il faut pour un été au Sud."
      />
    </div>
  );
}
