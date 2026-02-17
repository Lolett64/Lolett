import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ProductDetails } from '@/components/product/ProductDetails';
import { ProductLooks } from '@/components/product/ProductLooks';
import { getProductBySlug } from '@/data/products';
import { getLooksForProduct } from '@/data/looks';
import { getCategoryBySlug } from '@/data/categories';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: 'Produit non trouvé' };
  }

  const productUrl = `${BASE_URL}/produit/${product.slug}`;

  return {
    title: product.name,
    description: product.description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.name} | LOLETT`,
      description: product.description,
      url: productUrl,
      type: 'website',
      images: product.images.map((img) => ({
        url: img,
        alt: product.name,
      })),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const looks = getLooksForProduct(product.id);
  const category = getCategoryBySlug(product.gender, product.categorySlug);
  const genderLabel = product.gender === 'homme' ? 'Homme' : 'Femme';

  return (
    <div className="pt-20 pb-16 sm:pt-24 sm:pb-20">
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

        {looks.length > 0 && <ProductLooks looks={looks} />}
      </div>
    </div>
  );
}
