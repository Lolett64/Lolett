import type { Category } from '@/types';

export const categories: Category[] = [
  // Homme
  {
    id: 'cat-001',
    gender: 'homme',
    slug: 'hauts',
    label: 'Hauts',
    seoTitle: 'Hauts Homme — LOLETT',
    seoDescription:
      'T-shirts, polos et chemises homme. Des hauts qui font le style, signés LOLETT.',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-002',
    gender: 'homme',
    slug: 'bas',
    label: 'Bas',
    seoTitle: 'Bas Homme — LOLETT',
    seoDescription:
      'Pantalons, shorts et joggers homme. Coupe parfaite pour un look LOLETT.',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-003',
    gender: 'homme',
    slug: 'chaussures',
    label: 'Chaussures',
    seoTitle: 'Chaussures Homme — LOLETT',
    seoDescription:
      'Sneakers et chaussures homme. Le bon pied pour sortir en style.',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-004',
    gender: 'homme',
    slug: 'accessoires',
    label: 'Accessoires',
    seoTitle: 'Accessoires Homme — LOLETT',
    seoDescription:
      'Casquettes, sacs et accessoires homme. Le detail qui fait toute la difference.',
    createdAt: '2024-01-01T00:00:00Z',
  },
  // Femme
  {
    id: 'cat-005',
    gender: 'femme',
    slug: 'hauts',
    label: 'Hauts',
    seoTitle: 'Hauts Femme — LOLETT',
    seoDescription:
      'Tops, blouses et chemisiers femme. Collection LOLETT qui fait tourner les tetes.',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-006',
    gender: 'femme',
    slug: 'bas',
    label: 'Bas',
    seoTitle: 'Bas Femme — LOLETT',
    seoDescription:
      'Jupes, pantalons et shorts femme. Style LOLETT pour toutes les occasions.',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-007',
    gender: 'femme',
    slug: 'chaussures',
    label: 'Chaussures',
    seoTitle: 'Chaussures Femme — LOLETT',
    seoDescription:
      'Sneakers, sandales et chaussures femme. LOLETT te met sur ton 31.',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-008',
    gender: 'femme',
    slug: 'accessoires',
    label: 'Accessoires',
    seoTitle: 'Accessoires Femme — LOLETT',
    seoDescription:
      'Bijoux, sacs et accessoires femme. Le petit plus qui change tout.',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export function getCategoryBySlug(gender: string, slug: string): Category | undefined {
  return categories.find((c) => c.gender === gender && c.slug === slug);
}

export function getCategoriesByGender(gender: string): Category[] {
  return categories.filter((c) => c.gender === gender);
}
