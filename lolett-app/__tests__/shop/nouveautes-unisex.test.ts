import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNouveautesFilters } from '@/components/product/nouveautes/useNouveautesFilters';
import type { Gender, Product } from '@/types';

function mkProduct(id: string, gender: Gender): Product {
  return {
    id,
    slug: id,
    name: id,
    gender,
    categorySlug: 'hauts',
    price: 30,
    images: [],
    description: '',
    sizes: ['M'],
    colors: [],
    stock: 5,
    isNew: true,
    tags: [],
  };
}

const products: Product[] = [
  mkProduct('robe-femme', 'femme'),
  mkProduct('chemise-homme', 'homme'),
  mkProduct('tshirt-unisexe', 'both'),
];

describe('useNouveautesFilters — produits unisexes', () => {
  it("montre l'unisexe dans l'onglet Femme (onglet par défaut)", () => {
    const { result } = renderHook(() => useNouveautesFilters(products));
    const ids = result.current.genderProducts.map((p) => p.id);

    expect(ids).toContain('tshirt-unisexe');
    expect(ids).toContain('robe-femme');
    expect(ids).not.toContain('chemise-homme');
  });

  it("montre aussi l'unisexe dans l'onglet Homme", () => {
    const { result } = renderHook(() => useNouveautesFilters(products));

    act(() => {
      result.current.handleGenderChange('homme');
    });

    const ids = result.current.genderProducts.map((p) => p.id);
    expect(ids).toContain('tshirt-unisexe');
    expect(ids).toContain('chemise-homme');
    expect(ids).not.toContain('robe-femme');
  });
});
