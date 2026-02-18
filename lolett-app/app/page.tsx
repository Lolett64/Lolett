import type { Metadata } from 'next';
import {
  HeroSection,
  NewArrivalsSection,
  CollectionsSection,
  LooksSection,
  BrandStorySection,
  TestimonialsSection,
  SocialFeedSection,
  NewsletterSection,
  StoryQuote,
} from '@/components/sections/home';
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

export default async function HomePage() {
  const newProducts = await productRepository.findMany({ isNew: true, limit: 4 });
  const looks = await lookRepository.findMany();

  const lookProductsEntries = await Promise.all(
    looks.map(async (look: { id: string; productIds: string[] }) => {
      const products = await productRepository.findByIds(look.productIds);
      return [look.id, products] as const;
    })
  );
  const lookProducts = Object.fromEntries(lookProductsEntries);

  return (
    <>
      <HeroSection />
      <NewArrivalsSection products={newProducts} />
      <BrandStorySection />
      <LooksSection looks={looks} lookProducts={lookProducts} />
      <TestimonialsSection reviews={reviews} />
      <SocialFeedSection />
      <NewsletterSection />

      {/* Disclaimer LOLETT */}
      <section className="py-6 text-center" style={{ background: '#f7f0e4', borderTop: '1px solid rgba(196,180,156,0.2)' }}>
        <p className="text-sm italic" style={{ color: '#5a4d3e' }}>
          LOLETT décline toute responsabilité en cas de coup de coeur.
        </p>
      </section>
    </>
  );
}
