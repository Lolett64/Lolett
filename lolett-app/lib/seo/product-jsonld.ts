export interface ProductJsonLdInput {
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  currency: string;
  stock: number;
  sku: string;
  baseUrl: string;
}

export interface ProductJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description: string;
  image?: string[];
  sku: string;
  brand: { '@type': 'Brand'; name: 'LOLETT' };
  offers: {
    '@type': 'Offer';
    url: string;
    priceCurrency: string;
    price: number;
    availability: 'https://schema.org/InStock' | 'https://schema.org/OutOfStock';
    itemCondition: 'https://schema.org/NewCondition';
  };
}

export function buildProductJsonLd(input: ProductJsonLdInput): ProductJsonLd {
  const url = `${input.baseUrl}/produit/${input.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    image: input.images.length > 0 ? input.images : undefined,
    sku: input.sku,
    brand: { '@type': 'Brand', name: 'LOLETT' },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: input.currency,
      price: input.price,
      availability:
        input.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}
