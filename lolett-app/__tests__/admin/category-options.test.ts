import { describe, it, expect } from 'vitest';
import { categoryOptionsForGender, categoryGendersFromBody } from '@/lib/category-options';

const rows = [
  { gender: 'femme', slug: 'hauts', label: 'Hauts' },
  { gender: 'femme', slug: 'pull-gilet', label: 'Pulls & Gilets' },
  { gender: 'homme', slug: 'hauts', label: 'Hauts' },
  { gender: 'homme', slug: 'vestes', label: 'Vestes' },
];

const slugs = (options: { slug: string }[]) => options.map((o) => o.slug);

describe('categoryOptionsForGender — liste du formulaire produit', () => {
  it('affiche les catégories créées en base pour le genre choisi', () => {
    expect(slugs(categoryOptionsForGender(rows, 'femme'))).toEqual(['hauts', 'pull-gilet']);
    expect(slugs(categoryOptionsForGender(rows, 'homme'))).toEqual(['hauts', 'vestes']);
  });

  it('propose toutes les catégories, sans doublon, pour un produit unisexe', () => {
    expect(slugs(categoryOptionsForGender(rows, 'both'))).toEqual(['hauts', 'pull-gilet', 'vestes']);
  });

  it('ne propose rien tant que le genre n’est pas choisi', () => {
    expect(categoryOptionsForGender(rows, '')).toEqual([]);
  });

  it('garde la catégorie actuelle d’un produit même si elle n’est plus dans la liste', () => {
    expect(slugs(categoryOptionsForGender(rows, 'femme', 'robes'))).toContain('robes');
  });

  it('n’ajoute pas de doublon quand la catégorie actuelle existe déjà', () => {
    const options = categoryOptionsForGender(rows, 'femme', 'hauts');
    expect(slugs(options).filter((s) => s === 'hauts')).toHaveLength(1);
  });
});

describe('categoryGendersFromBody — cases Homme / Femme de la page Catégories', () => {
  it('Homme et Femme cochés : crée la catégorie des deux côtés', () => {
    expect(categoryGendersFromBody({ genders: ['homme', 'femme'] })).toEqual(['homme', 'femme']);
  });

  it('accepte encore un genre seul (ancien format)', () => {
    expect(categoryGendersFromBody({ gender: 'femme' })).toEqual(['femme']);
  });

  it('ignore les doublons et les valeurs inconnues', () => {
    expect(categoryGendersFromBody({ genders: ['femme', 'femme', 'both', 42] })).toEqual(['femme']);
  });

  it('renvoie une liste vide si rien n’est coché', () => {
    expect(categoryGendersFromBody({ genders: [] })).toEqual([]);
    expect(categoryGendersFromBody(null)).toEqual([]);
  });
});
