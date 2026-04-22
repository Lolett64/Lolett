import type { Metadata } from 'next';
import { ShopContentV4 } from '@/components/product/ShopContentV4';
import { productRepository, categoryRepository } from '@/lib/adapters';
import { getSiteContent } from '@/lib/cms/content';

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
  const [products, categories, cms] = await Promise.all([
    productRepository.findMany({ gender: 'femme', limit: 24 }),
    categoryRepository.findByGender('femme'),
    getSiteContent('shop_femme'),
  ]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF5E6' }}>
      <ShopContentV4
        gender="femme"
        products={products}
        categories={categories}
        heroColor="#2418a6"
        heroHeight="h-[35vh] min-h-[280px]"
        heroTitle={cms.hero_title || 'Collection Femme'}
        heroSubtitle={cms.hero_subtitle || "Robes fluides, tops en lin. L'art de vivre à la mode du Sud-Ouest."}
      />
    </div>
  );
}
