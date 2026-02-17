import type { Look } from '@/types';
import { products, getProductsByIds } from './products';

export const looks: Look[] = [
  {
    id: 'look-001',
    title: 'Le Méditerranéen',
    gender: 'homme',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    productIds: ['prod-001', 'prod-002', 'prod-006'],
    vibe: "Soirée d'été en terrasse",
    shortPitch:
      'Lin, chino, ceinture cuir. Le trio gagnant pour une soirée parfaite sous les étoiles.',
    createdAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'look-002',
    title: 'La Provençale',
    gender: 'femme',
    coverImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
    productIds: ['prod-007', 'prod-011', 'prod-012'],
    vibe: 'Marché du dimanche matin',
    shortPitch: "Robe fluide, panier tressé, foulard soie. L'art de vivre à la française.",
    createdAt: '2024-06-02T00:00:00Z',
  },
];

export function getLookById(id: string): Look | undefined {
  return looks.find((l) => l.id === id);
}

export function getLooksByGender(gender: string): Look[] {
  return looks.filter((l) => l.gender === gender);
}

export function getLooksForProduct(productId: string): Look[] {
  return looks.filter((l) => l.productIds.includes(productId));
}

export function getLookProducts(look: Look) {
  return getProductsByIds(look.productIds);
}

export function isLookAvailable(look: Look): boolean {
  const lookProducts = getProductsByIds(look.productIds);
  return lookProducts.every((p) => p.stock > 0);
}
