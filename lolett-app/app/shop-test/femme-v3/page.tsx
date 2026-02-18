import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ShopContentV3 } from '@/components/product/ShopContentV3';
import { productRepository, categoryRepository } from '@/lib/adapters';

export const metadata: Metadata = {
  title: 'Shop Femme V3 — LOLETT Test',
};

export default async function ShopFemmeV3Page() {
  const products = await productRepository.findMany({ gender: 'femme' });
  const categories = await categoryRepository.findByGender('femme');

  return (
    <div className="pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="container">
        <Breadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: 'Femme V3' }]} />
        <ShopContentV3
          gender="femme"
          products={products}
          categories={categories}
          heroImage="https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1600&q=80"
          heroTitle="Collection Femme"
          heroSubtitle="Robes fluides, tops en lin. L'art de vivre à la méditerranéenne."
        />
      </div>
    </div>
  );
}
