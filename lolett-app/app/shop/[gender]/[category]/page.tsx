import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShopContentV2 } from '@/components/product/ShopContentV2';
import { productRepository, categoryRepository } from '@/lib/adapters';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

const HERO_IMAGES = {
  homme: 'https://images.unsplash.com/photo-1771148885935-c57afa2726bc?w=1600&q=80',
  femme: 'https://plus.unsplash.com/premium_photo-1683141076955-bddd5efbb03c?w=1600&q=80',
} as const;

const HERO_POSITIONS = {
  homme: 'center 65%',
  femme: 'center center',
} as const;

interface PageProps {
  params: Promise<{ gender: string; category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { gender, category: categorySlug } = await params;
  const category = await categoryRepository.findBySlug(gender, categorySlug);
  if (!category) return { title: 'Catégorie non trouvée' };

  const genderLabel = gender === 'homme' ? 'Homme' : 'Femme';
  const title = `${category.label} ${genderLabel} — LOLETT`;
  const canonicalUrl = `${BASE_URL}/shop/${gender}/${categorySlug}`;

  return {
    title,
    description: category.seoDescription,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description: category.seoDescription, url: canonicalUrl, type: 'website' },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { gender, category: categorySlug } = await params;

  if (gender !== 'homme' && gender !== 'femme') notFound();

  const category = await categoryRepository.findBySlug(gender, categorySlug);
  if (!category) notFound();

  const products = await productRepository.findByCategory(gender, categorySlug);
  const categories = await categoryRepository.findByGender(gender);
  const genderLabel = gender === 'homme' ? 'Homme' : 'Femme';

  return (
    <div className="pt-20 sm:pt-24">
      <ShopContentV2
        gender={gender}
        products={products}
        categories={categories}
        activeCategory={categorySlug}
        heroImage={HERO_IMAGES[gender]}
        heroImagePosition={HERO_POSITIONS[gender]}
        heroTitle={`${category.label} ${genderLabel}`}
        heroSubtitle={category.seoDescription || `Découvrez notre sélection ${category.label.toLowerCase()} pour ${gender === 'homme' ? 'lui' : 'elle'}.`}
      />
    </div>
  );
}
