import { describe, it, expect } from 'vitest';
import { categoryOptionsForGender } from '@/lib/category-options';

const rows = [
  { gender: 'femme', slug: 'hauts', label: 'Hauts' },
  { gender: 'femme', slug: 'pull-gilet', label: 'Pulls & Gilets' },
  { gender: 'homme', slug: 'hauts', label: 'Hauts' },
  { gender: 'homme', slug: 'vestes', label: 'Vestes' },
  { gender: 'both', slug: 'accessoires', label: 'Accessoires' },
];

const slugs = (options: { slug: string }[]) => options.map((o) => o.slug);

describe('categoryOptionsForGender — liste du formulaire produit', () => {
  it('affiche les catégories créées en base pour le genre choisi', () => {
    expect(slugs(categoryOptionsForGender(rows, 'femme'))).toEqual([
      'accessoires',
      'hauts',
      'pull-gilet',
    ]);
  });

  it('ajoute les catégories unisexes aux deux genres', () => {
    expect(slugs(categoryOptionsForGender(rows, 'homme'))).toEqual(['accessoires', 'hauts', 'vestes']);
  });

  it('propose toutes les catégories, sans doublon, pour un produit unisexe', () => {
    expect(slugs(categoryOptionsForGender(rows, 'both'))).toEqual([
      'accessoires',
      'hauts',
      'pull-gilet',
      'vestes',
    ]);
  });

  it('ne propose rien tant que le genre n’est pas choisi', () => {
    expect(categoryOptionsForGender(rows, '')).toEqual([]);
  });

  it('garde la catégorie actuelle d’un produit même si elle n’est plus dans la liste', () => {
    const options = categoryOptionsForGender(rows, 'femme', 'robes');
    expect(slugs(options)).toContain('robes');
  });

  it('n’ajoute pas de doublon quand la catégorie actuelle existe déjà', () => {
    const options = categoryOptionsForGender(rows, 'femme', 'hauts');
    expect(slugs(options).filter((s) => s === 'hauts')).toHaveLength(1);
  });
});
