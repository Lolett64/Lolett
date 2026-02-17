import type { Metadata } from 'next';
import {
  HeroSection,
  MarqueeSection,
  TrustBarSection,
  NewArrivalsSection,
  CollectionsSection,
  LooksSection,
  BrandStorySection,
  TestimonialsSection,
  SocialFeedSection,
  NewsletterSection,
} from '@/components/sections/home';
import { getNewProducts } from '@/data/products';
import { looks } from '@/data/looks';
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

export default function HomePage() {
  const newProducts = getNewProducts(4);

  return (
    <>
      <HeroSection />
      <MarqueeSection />
      <TrustBarSection />
      <NewArrivalsSection products={newProducts} />
      <CollectionsSection />
      <LooksSection looks={looks} />
      <BrandStorySection />
      <TestimonialsSection reviews={reviews} />
      <SocialFeedSection />
      <NewsletterSection />

      {/* Disclaimer LOLETT */}
      <section className="bg-lolett-gray-100 py-6 text-center">
        <p className="text-lolett-gray-500 text-sm italic">
          LOLETT décline toute responsabilité en cas de coup de coeur.
        </p>
      </section>
    </>
  );
}
