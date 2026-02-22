import type { Metadata } from 'next';
import {
  HeroSection,
  NewArrivalsSection,
  CollectionsSection,
  LooksSection,
  BrandStorySection,
  TestimonialsSection,
  NewsletterSection,
} from '@/components/sections/home-v3';
import { productRepository, lookRepository } from '@/lib/adapters';
import { reviews } from '@/data/reviews';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'LOLETT — Mode Homme & Femme | Looks complets prêt à sortir',
  description:
    'LOLETT, la mode méditerranéenne pour homme et femme. Des looks complets, pensés au Sud et prêts à porter. Lin, coton, style solaire — livraison offerte dès 100 €.',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: 'LOLETT — Mode Homme & Femme | Looks complets prêt à sortir',
    description:
      'Des looks complets pensés au Sud. Pour lui, pour elle. Livraison offerte dès 100 €.',
    url: BASE_URL,
    siteName: 'LOLETT',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LOLETT — Mode Homme & Femme | Looks complets prêt à sortir',
    description: 'Des looks complets pensés au Sud. Pour lui, pour elle.',
  },
};

const hexColor = "#FDF5E6";

const content = {
  title_line1: "L'Héritage",
  title_line2: "Terroir",
  subtitle: "Atelier Bordeaux",
  description: "L'élégance sans effort. Le lin noble et la coupe juste, pour lui et pour elle.",
  video_src: "/videos/hero-beach.mp4",
};

export default async function HomePage() {
  const newProducts = (await productRepository.findMany({ isNew: true })).slice(0, 4);
  const featuredLooks = (await lookRepository.findMany()).slice(0, 3);

  const lookProductsEntries = await Promise.all(
    featuredLooks.map(async (look) => {
      const products = await productRepository.findByIds(look.productIds);
      return [look.id, products] as const;
    })
  );
  const lookProducts = Object.fromEntries(lookProductsEntries);

  return (
    <div
      className="min-h-screen relative font-[family-name:var(--font-montserrat)] text-[#1B0B94]"
      style={{ backgroundColor: hexColor }}
    >
      <main>
        <HeroSection content={content} hexColor={hexColor} />
        <CollectionsSection content={content} hexColor={hexColor} />
        <NewArrivalsSection products={newProducts} hexColor={hexColor} />
        <BrandStorySection content={content} hexColor={hexColor} />
        <LooksSection looks={featuredLooks} lookProducts={lookProducts} hexColor={hexColor} />
        <TestimonialsSection reviews={reviews} hexColor={hexColor} />
        <NewsletterSection content={content} hexColor={hexColor} />
      </main>
    </div>
  );
}
