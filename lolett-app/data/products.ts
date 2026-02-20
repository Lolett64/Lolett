import type { Product } from '@/types';

export const products: Product[] = [
  // HOMME - 5 produits
  {
    id: 'prod-001',
    slug: 'chemise-lin-mediterranee',
    name: 'Chemise Lin Méditerranée',
    gender: 'homme',
    categorySlug: 'chemises',
    price: 89,
    images: [
      '/images/chemise-lin-mediterranee.png',
    ],
    description:
      "Chemise en lin léger, parfaite pour les soirées d'été. Coupe décontractée, finitions soignées. Le lin s'adoucit à chaque lavage.",
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Blanc Écume', hex: '#F5F5F5' },
      { name: 'Bleu Ciel', hex: '#87CEEB' },
    ],
    stock: 15,
    isNew: true,
    tags: ['lin', 'été', 'essentiel'],
    createdAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'prod-002',
    slug: 'pantalon-chino-sable',
    name: 'Chino Sable',
    gender: 'homme',
    categorySlug: 'pantalons',
    price: 95,
    images: [
      '/images/chino-sable.png',
    ],
    description:
      'Chino coupe slim en coton stretch. Confortable du matin au soir. La pièce indispensable de votre garde-robe estivale.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Sable', hex: '#C2B280' },
      { name: 'Marine', hex: '#1B3A57' },
    ],
    stock: 12,
    isNew: true,
    tags: ['coton', 'casual', 'essentiel'],
    createdAt: '2024-06-02T00:00:00Z',
  },
  {
    id: 'prod-003',
    slug: 'polo-pique-riviera',
    name: 'Polo Piqué Riviera',
    gender: 'homme',
    categorySlug: 'chemises',
    price: 65,
    images: [
      '/images/polo-pique-riviera.png',
    ],
    description:
      "Polo en coton piqué premium. Col souple, coupe ajustée. L'élégance décontractée à la française.",
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Blanc', hex: '#FFFFFF' },
      { name: 'Bleu LOLETT', hex: '#2418A6' },
    ],
    stock: 20,
    isNew: false,
    tags: ['coton', 'classique', 'polo'],
    createdAt: '2024-05-15T00:00:00Z',
  },
  {
    id: 'prod-004',
    slug: 'bermuda-lin-mistral',
    name: 'Bermuda Lin Mistral',
    gender: 'homme',
    categorySlug: 'pantalons',
    price: 75,
    images: [
      '/images/bermuda-lin-mistral.png',
    ],
    description:
      "Bermuda en lin mélangé, taille élastiquée au dos. Parfait pour la plage comme pour l'apéro.",
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Beige', hex: '#D4C4A8' },
      { name: 'Olive', hex: '#808000' },
    ],
    stock: 8,
    isNew: false,
    tags: ['lin', 'été', 'décontracté'],
    createdAt: '2024-05-20T00:00:00Z',
  },
  {
    id: 'prod-006',
    slug: 'ceinture-cuir-tresse',
    name: 'Ceinture Cuir Tressé',
    gender: 'homme',
    categorySlug: 'accessoires',
    price: 55,
    images: [
      '/images/ceinture-cuir-tresse.jpg',
    ],
    description:
      "Ceinture en cuir tressé, boucle en laiton vieilli. L'accessoire qui fait la différence.",
    sizes: ['TU'],
    colors: [
      { name: 'Cognac', hex: '#834A27' },
      { name: 'Noir', hex: '#1A1A1A' },
    ],
    stock: 18,
    isNew: false,
    tags: ['cuir', 'accessoire', 'ceinture'],
    createdAt: '2024-05-01T00:00:00Z',
  },

  // FEMME - 6 produits
  {
    id: 'prod-007',
    slug: 'robe-midi-provencale',
    name: 'Robe Midi Provençale',
    gender: 'femme',
    categorySlug: 'robes',
    price: 129,
    images: [
      '/images/robe-midi-provencale.png',
    ],
    description:
      'Robe midi fluide en viscose imprimée. Bretelles ajustables, dos légèrement ouvert. Féminité et confort absolu.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Terracotta', hex: '#E2725B' },
      { name: 'Bleu Lavande', hex: '#9683EC' },
    ],
    stock: 10,
    isNew: true,
    tags: ['viscose', 'été', 'robe'],
    createdAt: '2024-06-05T00:00:00Z',
  },
  {
    id: 'prod-008',
    slug: 'top-lin-côte-azur',
    name: "Top Lin Côte d'Azur",
    gender: 'femme',
    categorySlug: 'tops',
    price: 69,
    images: [
      '/images/top-lin-cote-azur.png',
    ],
    description:
      "Top en lin avec détails brodés. Coupe ample et légère. L'essentiel de l'été méditerranéen.",
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Blanc', hex: '#FFFFFF' },
      { name: 'Bleu Ciel', hex: '#87CEEB' },
    ],
    stock: 14,
    isNew: true,
    tags: ['lin', 'été', 'top'],
    createdAt: '2024-06-08T00:00:00Z',
  },
  {
    id: 'prod-009',
    slug: 'jupe-longue-soleil',
    name: 'Jupe Longue Soleil',
    gender: 'femme',
    categorySlug: 'robes',
    price: 89,
    images: [
      '/images/jupe-longue-soleil.jpeg',
    ],
    description:
      'Jupe longue fluide avec taille élastiquée. Imprimé exclusif LOLETT. Mouvements et légèreté.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Ocre', hex: '#CC7722' },
      { name: 'Crème', hex: '#FFFDD0' },
    ],
    stock: 7,
    isNew: false,
    tags: ['viscose', 'été', 'jupe'],
    createdAt: '2024-05-25T00:00:00Z',
  },
  {
    id: 'prod-010',
    slug: 'blouse-romantique-calanques',
    name: 'Blouse Romantique Calanques',
    gender: 'femme',
    categorySlug: 'tops',
    price: 79,
    images: [
      '/images/blouse-romantique-calanques.jpg',
    ],
    description: 'Blouse en coton avec manches bouffantes et détails dentelle. Romantisme assumé.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Blanc Cassé', hex: '#FAF9F6' },
      { name: 'Rose Poudré', hex: '#E8CCD7' },
    ],
    stock: 11,
    isNew: false,
    tags: ['coton', 'romantique', 'blouse'],
    createdAt: '2024-05-18T00:00:00Z',
  },
  {
    id: 'prod-011',
    slug: 'sac-paille-plage',
    name: 'Panier Plage Tressé',
    gender: 'femme',
    categorySlug: 'accessoires',
    price: 59,
    images: [
      '/images/panier-plage-tresse.png',
    ],
    description:
      'Panier en paille naturelle avec anses en cuir. De la plage au marché, le compagnon idéal.',
    sizes: ['TU'],
    colors: [{ name: 'Naturel', hex: '#D4B896' }],
    stock: 20,
    isNew: true,
    tags: ['paille', 'été', 'sac'],
    createdAt: '2024-06-12T00:00:00Z',
  },
  {
    id: 'prod-012',
    slug: 'foulard-soie-mimosa',
    name: 'Foulard Soie Mimosa',
    gender: 'femme',
    categorySlug: 'accessoires',
    price: 49,
    images: [
      '/images/foulard-soie-mimosa.jpg',
    ],
    description:
      'Foulard en soie naturelle, imprimé mimosa exclusif. En tour de cou, dans les cheveux ou sur votre sac.',
    sizes: ['TU'],
    colors: [
      { name: 'Jaune Mimosa', hex: '#F4B740' },
      { name: 'Bleu Nuit', hex: '#191970' },
    ],
    stock: 30,
    isNew: false,
    tags: ['soie', 'accessoire', 'foulard'],
    createdAt: '2024-05-10T00:00:00Z',
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByGender(gender: string): Product[] {
  return products.filter((p) => p.gender === gender);
}

export function getProductsByCategory(gender: string, categorySlug: string): Product[] {
  return products.filter((p) => p.gender === gender && p.categorySlug === categorySlug);
}

export function getNewProducts(limit?: number): Product[] {
  const newProducts = products.filter((p) => p.isNew);
  return limit ? newProducts.slice(0, limit) : newProducts;
}

export function getProductsByIds(ids: string[]): Product[] {
  return ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined);
}
