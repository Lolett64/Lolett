import type { Metadata } from 'next';
import {
  HeroSection,
  TrustBarSection,
  NewArrivalsSectionV2,
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
  title: 'LOLETT — V2 Nouveautés | Mode Homme & Femme',
  description:
    'Variation V2 de la home LOLETT avec une section nouveautés plus éditoriale. Mode méditerranéenne, looks complets et capsules solaires.',
  alternates: {
    canonical: `${BASE_URL}/home-v2`,
  },
  openGraph: {
    title: 'LOLETT — V2 Nouveautés | Mode Homme & Femme',
    description:
      'Découvrez la variation V2 de la home LOLETT et sa nouvelle section nouveautés à la mise en scène plus éditoriale.',
    url: `${BASE_URL}/home-v2`,
    siteName: 'LOLETT',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LOLETT — V2 Nouveautés | Mode Homme & Femme',
    description:
      'Variation de la home LOLETT avec une section nouveautés plus éditoriale, pensée comme une capsule solaire.',
  },
};

export default async function HomePageV2() {
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
      <TrustBarSection />
      <NewArrivalsSectionV2 products={newProducts} />
      <CollectionsSection />
      <StoryQuote
        quote={"La mode n'est pas une question d'image,\nmais une question de lumière."}
        author="L'esprit du Sud"
      />
      <LooksSection looks={looks} lookProducts={lookProducts} />
      <BrandStorySection />
      <TestimonialsSection reviews={reviews} />
      <SocialFeedSection />
      <NewsletterSection />

      {/* Disclaimer LOLETT */}
      <section
        className="py-6 text-center"
        style={{ background: '#f7f0e4', borderTop: '1px solid rgba(196,180,156,0.2)' }}
      >
        <p className="text-sm italic" style={{ color: '#5a4d3e' }}>
          LOLETT décline toute responsabilité en cas de coup de coeur.
        </p>
      </section>
    </>
  );
}

