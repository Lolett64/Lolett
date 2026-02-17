import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandHeading } from '@/components/brand/BrandHeading';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { getProductsByGender } from '@/data/products';
import { getCategoriesByGender } from '@/data/categories';
import { ProductSorting } from '@/components/product/ProductSorting';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Sélection Femme — LOLETT',
  description:
    'Découvrez la sélection femme LOLETT. Robes fluides, tops en lin, accessoires solaires — l\'art de vivre à la méditerranéenne. Livraison offerte dès 100 €.',
  alternates: {
    canonical: `${BASE_URL}/shop/femme`,
  },
  openGraph: {
    title: 'Sélection Femme — LOLETT',
    description: 'Robes fluides, tops en lin. L\'art de vivre à la méditerranéenne.',
    url: `${BASE_URL}/shop/femme`,
    type: 'website',
  },
};

export default function ShopFemmePage() {
  const products = getProductsByGender('femme');
  const categories = getCategoriesByGender('femme');

  return (
    <div className="pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="container">
        <Breadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: 'Femme' }]} />

        <div className="mt-6 mb-8 sm:mt-8 sm:mb-12">
          <BrandHeading as="h1" size="2xl">
            Collection Femme
          </BrandHeading>
          <p className="text-lolett-gray-600 mt-4 max-w-[55ch] leading-relaxed">
            Robes fluides, tops en lin. L&apos;art de vivre à la méditerranéenne.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 sm:mb-8 sm:gap-3">
          <Link
            href="/shop/femme"
            className="bg-lolett-blue rounded-full px-3 py-2 text-sm font-medium text-white sm:px-4"
          >
            Tout voir
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop/femme/${cat.slug}`}
              className="bg-lolett-gray-100 text-lolett-gray-600 hover:bg-lolett-gray-200 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:px-4"
            >
              {cat.label}
            </Link>
          ))}
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lolett-gray-500 text-sm">
            {products.length} produit{products.length > 1 ? 's' : ''}
          </p>
          <ProductSorting />
        </div>

        <ProductGrid products={products} />
      </div>
    </div>
  );
}
