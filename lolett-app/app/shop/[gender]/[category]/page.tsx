import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShopContentV4 } from '@/components/product/ShopContentV4';
import { productRepository, categoryRepository } from '@/lib/adapters';

export const revalidate = 60;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

const HERO_CONFIG = {
  homme: {
    image: 'https://images.unsplash.com/photo-1771148885935-c57afa2726bc?w=1600&q=80',
    position: '50% 60%',
    scale: 1.0,
  },
  femme: {
    image: 'https://plus.unsplash.com/premium_photo-1683141076955-bddd5efbb03c?w=1600&q=80',
    position: '50% 50%',
    scale: 1,
  },
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
    <div className="min-h-screen" style={{ backgroundColor: '#FDF5E6' }}>
      <ShopContentV4
        gender={gender}
        products={products}
        categories={categories}
        activeCategory={categorySlug}
        heroImage={HERO_CONFIG[gender].image}
        heroImagePosition={HERO_CONFIG[gender].position}
        heroImageScale={HERO_CONFIG[gender].scale}
        heroHeight="h-[35vh] min-h-[300px]"
        heroTitle={`${category.label} ${genderLabel}`}
        heroSubtitle={category.seoDescription || `Découvrez notre sélection ${category.label.toLowerCase()} pour ${gender === 'homme' ? 'lui' : 'elle'}.`}
      />
    </div>
  );
}
