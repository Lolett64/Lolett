import type { Metadata } from 'next';
import { ShopContentV4 } from '@/components/product/ShopContentV4';
import { productRepository, categoryRepository } from '@/lib/adapters';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Sélection Homme — LOLETT',
  description:
    'Découvrez la sélection homme LOLETT. Lin léger, coton premium, looks complets pensés pour le Sud. Livraison offerte dès 100 €.',
  alternates: { canonical: `${BASE_URL}/shop/homme` },
  openGraph: {
    title: 'Sélection Homme — LOLETT',
    description: "Lin léger, coton premium. Tout ce qu'il faut pour un été au Sud.",
    url: `${BASE_URL}/shop/homme`,
    type: 'website',
  },
};

export default async function ShopHommePage() {
  const products = await productRepository.findMany({ gender: 'homme' });
  const categories = await categoryRepository.findByGender('homme');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF5E6' }}>
      <ShopContentV4
        gender="homme"
        products={products}
        categories={categories}
        heroImage="https://images.unsplash.com/photo-1771148885935-c57afa2726bc?w=1600&q=80"
        heroImagePosition="50% 60%"
        heroImageScale={1.0}
        heroHeight="h-[35vh] min-h-[300px]"
        heroTitle="Collection Homme"
        heroSubtitle="Lin léger, coton premium. Tout ce qu'il faut pour un été au Sud."
      />
    </div>
  );
}
