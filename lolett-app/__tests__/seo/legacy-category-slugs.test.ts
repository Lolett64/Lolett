import { describe, it, expect } from 'vitest';
import { legacyCategorySlug } from '@/lib/legacy-category-slugs';

describe('anciennes adresses de catégorie (référencées par Google)', () => {
  it('redirige les anciens slugs vers la catégorie actuelle', () => {
    expect(legacyCategorySlug('femme', 'hauts')).toBe('t-shirts-bodys-tops');
    expect(legacyCategorySlug('femme', 'pull-gilet')).toBe('pulls-gilets-sweat-shirts');
    expect(legacyCategorySlug('homme', 'bas')).toBe('pantalons-jeans-joggings');
  });
  it('slug inconnu ou genre invalide : pas de redirection', () => {
    expect(legacyCategorySlug('femme', 'n-importe-quoi')).toBeNull();
    expect(legacyCategorySlug('both', 'hauts')).toBeNull();
  });
});
