import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BrandHeading } from '@/components/brand/BrandHeading';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { getProductsByCategory } from '@/data/products';
import { getCategoryBySlug, getCategoriesByGender } from '@/data/categories';
import { ProductSorting } from '@/components/product/ProductSorting';

interface PageProps {
  params: Promise<{
    gender: string;
    category: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { gender, category: categorySlug } = await params;
  const category = getCategoryBySlug(gender, categorySlug);

  if (!category) {
    return { title: 'Catégorie non trouvée' };
  }

  return {
    title: category.seoTitle,
    description: category.seoDescription,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { gender, category: categorySlug } = await params;

  if (gender !== 'homme' && gender !== 'femme') {
    notFound();
  }

  const category = getCategoryBySlug(gender, categorySlug);
  if (!category) {
    notFound();
  }

  const products = getProductsByCategory(gender, categorySlug);
  const categories = getCategoriesByGender(gender);
  const genderLabel = gender === 'homme' ? 'Homme' : 'Femme';

  return (
    <div className="pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="container">
        <Breadcrumbs
          items={[
            { label: 'Shop', href: '/shop' },
            { label: genderLabel, href: `/shop/${gender}` },
            { label: category.label },
          ]}
        />

        <div className="mt-6 mb-8 sm:mt-8 sm:mb-12">
          <BrandHeading as="h1" size="2xl">
            {category.label} {genderLabel}
          </BrandHeading>
          <p className="text-lolett-gray-600 mt-4 max-w-[55ch] leading-relaxed">
            {category.seoDescription}
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 sm:mb-8 sm:gap-3">
          <Link
            href={`/shop/${gender}`}
            className="bg-lolett-gray-100 text-lolett-gray-600 hover:bg-lolett-gray-200 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:px-4"
          >
            Tout voir
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop/${gender}/${cat.slug}`}
              className={`rounded-full px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
                cat.slug === categorySlug
                  ? 'bg-lolett-blue text-white'
                  : 'bg-lolett-gray-100 text-lolett-gray-600 hover:bg-lolett-gray-200'
              }`}
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
