import type { Metadata } from 'next';
import { ShopContentV4 } from '@/components/product/ShopContentV4';
import { productRepository, categoryRepository } from '@/lib/adapters';
import { getSiteContent } from '@/lib/cms/content';

export const revalidate = 60;

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
  const [products, categories, cms] = await Promise.all([
    productRepository.findMany({ gender: 'homme', limit: 24 }),
    categoryRepository.findByGender('homme'),
    getSiteContent('shop_homme'),
  ]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF5E6' }}>
      <ShopContentV4
        gender="homme"
        products={products}
        categories={categories}
        heroColor="#2418a6"
        heroHeight="h-[35vh] min-h-[280px]"
        heroTitle={cms.hero_title || 'Collection Homme'}
        heroSubtitle={cms.hero_subtitle || "Lin léger, coton premium. Tout ce qu'il faut pour un été au Sud."}
      />
    </div>
  );
}
