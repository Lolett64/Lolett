import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ProductDetails } from '@/components/product/ProductDetails';
import { ProductLooks } from '@/components/product/ProductLooks';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { productRepository, lookRepository, categoryRepository } from '@/lib/adapters';

export const revalidate = 60;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const product = await productRepository.findBySlug(slug);

  if (!product) {
    return { title: 'Produit non trouvé' };
  }

  const productUrl = `${BASE_URL}/produit/${product.slug}`;

  const title = `${product.name} — LOLETT`;

  return {
    title,
    description: product.description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title,
      description: product.description,
      url: productUrl,
      type: 'website',
      images: product.images.map((img: string) => ({
        url: img,
        alt: product.name,
        width: 800,
        height: 1000,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: product.description,
      images: product.images[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const product = await productRepository.findBySlug(slug);

  if (!product) {
    notFound();
  }

  const looks = await lookRepository.findLooksForProduct(product.id);
  const category = await categoryRepository.findBySlug(product.gender, product.categorySlug);
  const genderLabel = product.gender === 'homme' ? 'Homme' : 'Femme';

  const lookProductsEntries = await Promise.all(
    looks.map(async (look: { id: string; productIds: string[] }) => {
      const products = await productRepository.findByIds(look.productIds);
      return [look.id, products] as const;
    })
  );
  const lookProducts = Object.fromEntries(lookProductsEntries);

  // Related products: same gender, exclude current product
  const allGenderProducts = await productRepository.findMany({ gender: product.gender });
  const relatedProducts = allGenderProducts.filter((p) => p.id !== product.id).slice(0, 4);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Shop', item: `${BASE_URL}/shop` },
      { '@type': 'ListItem', position: 2, name: genderLabel, item: `${BASE_URL}/shop/${product.gender}` },
      ...(category ? [{ '@type': 'ListItem', position: 3, name: category.label, item: `${BASE_URL}/shop/${product.gender}/${category.slug}` }] : []),
      { '@type': 'ListItem', position: category ? 4 : 3, name: product.name },
    ],
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    brand: { '@type': 'Brand', name: 'LOLETT' },
    url: `${BASE_URL}/produit/${product.slug}`,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/produit/${product.slug}`,
      seller: { '@type': 'Organization', name: 'LOLETT' },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: product.price >= 100 ? '0' : '5.90', currency: 'EUR' },
        deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' } },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'FR' },
      },
    },
  };

  return (
    <div className="pt-20 pb-16 sm:pt-24 sm:pb-20 min-h-screen" style={{ backgroundColor: '#FDF5E6' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container">
        <Breadcrumbs
          items={[
            { label: 'Shop', href: '/shop' },
            { label: genderLabel, href: `/shop/${product.gender}` },
            ...(category
              ? [{ label: category.label, href: `/shop/${product.gender}/${category.slug}` }]
              : []),
            { label: product.name },
          ]}
        />

        <ProductDetails product={product} />

        {looks.length > 0 && <ProductLooks looks={looks} lookProducts={lookProducts} />}

        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}
