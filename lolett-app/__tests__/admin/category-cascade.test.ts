import { describe, it, expect } from 'vitest';
import { categoryCountKey, categoryLabelFor, countProductsByCategory } from '@/lib/category-options';

const rows = [
  { gender: 'femme', slug: 'pantalons-jeans-joggings', label: 'Pantalons, jeans & joggings' },
  { gender: 'homme', slug: 'pantalons-jeans-joggings', label: 'Pantalons homme' },
  { gender: 'homme', slug: 'vestes-sweat-shirts-manteaux', label: 'Vestes, sweat-shirts & manteaux' },
];

describe('compteur de produits par catégorie (page Catégories)', () => {
  it('compte séparément Homme et Femme pour un même slug ; un unisexe compte des deux côtés', () => {
    const counts = countProductsByCategory([
      { gender: 'femme', category_slug: 'pantalons-jeans-joggings' },
      { gender: 'femme', category_slug: 'pantalons-jeans-joggings' },
      { gender: 'homme', category_slug: 'pantalons-jeans-joggings' },
      { gender: 'both', category_slug: 'pantalons-jeans-joggings' },
      { gender: 'femme', category_slug: null },
    ]);
    expect(counts[categoryCountKey('femme', 'pantalons-jeans-joggings')]).toBe(3);
    expect(counts[categoryCountKey('homme', 'pantalons-jeans-joggings')]).toBe(2);
  });
});

describe('nom de catégorie affiché dans la liste Produits', () => {
  it('prend le nom de la catégorie du bon genre', () => {
    expect(categoryLabelFor(rows, 'homme', 'pantalons-jeans-joggings')).toBe('Pantalons homme');
    expect(categoryLabelFor(rows, 'femme', 'pantalons-jeans-joggings')).toBe('Pantalons, jeans & joggings');
  });
  it('unisexe : le nom de la catégorie de l’une des boutiques', () => {
    expect(categoryLabelFor(rows, 'both', 'vestes-sweat-shirts-manteaux')).toBe('Vestes, sweat-shirts & manteaux');
  });
  it('slug inconnu : undefined', () => {
    expect(categoryLabelFor(rows, 'femme', 'disparu')).toBeUndefined();
  });
});
