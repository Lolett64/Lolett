import { describe, it, expect } from 'vitest';
import { buildProductJsonLd } from '@/lib/seo/product-jsonld';

describe('buildProductJsonLd', () => {
  it('emits Product schema with Offer and availability', () => {
    const jsonld = buildProductJsonLd({
      name: 'Isa Marron',
      slug: 'isa-marron',
      description: 'Top crop ajusté',
      images: ['https://cdn/p1.jpg'],
      price: 39,
      currency: 'EUR',
      stock: 15,
      sku: 'ISA-MARRON',
      baseUrl: 'https://lolettshop.com',
    });
    expect(jsonld['@type']).toBe('Product');
    expect(jsonld.offers['@type']).toBe('Offer');
    expect(jsonld.offers.price).toBe(39);
    expect(jsonld.offers.availability).toBe('https://schema.org/InStock');
    expect(jsonld.offers.url).toBe('https://lolettshop.com/produit/isa-marron');
    expect(jsonld.image).toEqual(['https://cdn/p1.jpg']);
    expect(jsonld.brand.name).toBe('LOLETT');
  });

  it('emits OutOfStock availability when stock is 0', () => {
    const jsonld = buildProductJsonLd({
      name: 'X',
      slug: 'x',
      description: '',
      images: [],
      price: 10,
      currency: 'EUR',
      stock: 0,
      sku: 'X',
      baseUrl: 'https://lolettshop.com',
    });
    expect(jsonld.offers.availability).toBe('https://schema.org/OutOfStock');
    expect(jsonld.image).toBeUndefined();
  });
});
