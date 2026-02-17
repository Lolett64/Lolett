import type { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'cat-001',
    gender: 'homme',
    slug: 'chemises',
    label: 'Chemises',
    seoTitle: 'Chemises Homme | LOLETT',
    seoDescription:
      'Découvrez notre collection de chemises homme. Style méditerranéen, qualité premium.',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-002',
    gender: 'homme',
    slug: 'pantalons',
    label: 'Pantalons',
    seoTitle: 'Pantalons Homme | LOLETT',
    seoDescription: 'Pantalons homme LOLETT. Coupe parfaite pour un été stylé.',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-003',
    gender: 'homme',
    slug: 'accessoires',
    label: 'Accessoires',
    seoTitle: 'Accessoires Homme | LOLETT',
    seoDescription: 'Accessoires homme pour compléter votre look LOLETT.',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-004',
    gender: 'femme',
    slug: 'robes',
    label: 'Robes',
    seoTitle: 'Robes Femme | LOLETT',
    seoDescription: 'Robes femme LOLETT. Élégance méditerranéenne pour toutes les occasions.',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-005',
    gender: 'femme',
    slug: 'tops',
    label: 'Tops',
    seoTitle: 'Tops Femme | LOLETT',
    seoDescription: 'Tops et blouses femme. Collection LOLETT inspirée du Sud.',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-006',
    gender: 'femme',
    slug: 'accessoires',
    label: 'Accessoires',
    seoTitle: 'Accessoires Femme | LOLETT',
    seoDescription: 'Accessoires femme pour sublimer votre style LOLETT.',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export function getCategoryBySlug(gender: string, slug: string): Category | undefined {
  return categories.find((c) => c.gender === gender && c.slug === slug);
}

export function getCategoriesByGender(gender: string): Category[] {
  return categories.filter((c) => c.gender === gender);
}
