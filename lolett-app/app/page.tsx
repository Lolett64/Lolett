import type { Metadata } from 'next';
import {
  HeroSection,
  NewArrivalsSection,
  LooksSection,
  BrandStorySection,
  NewsletterSection,
} from '@/components/sections/home-v3';
import { Fragment } from 'react';
import { productRepository, lookRepository } from '@/lib/adapters';
import { getSiteContent } from '@/lib/cms/content';
import { getPageSections } from '@/lib/cms/sections';

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
    images: [
      {
        url: `${BASE_URL}/og-lolett.jpg`,
        width: 800,
        height: 1000,
        alt: 'LOLETT — Mode Méditerranéenne',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LOLETT — Mode Homme & Femme | Looks complets prêt à sortir',
    description: 'Des looks complets pensés au Sud. Pour lui, pour elle.',
    images: [`${BASE_URL}/og-lolett.jpg`],
  },
};

// Revalidate every 60s so admin CMS changes appear quickly
export const revalidate = 60;

const hexColor = "#FDF5E6";

export default async function HomePage() {
  const [heroContent, newsletterContent, brandStoryContent, newProducts, featuredLooks, pageSections] = await Promise.all([
    getSiteContent('hero'),
    getSiteContent('newsletter'),
    getSiteContent('brand_story'),
    productRepository.findMany({ limit: 4 }),
    lookRepository.findMany().then((l) => l.slice(0, 3)),
    getPageSections('home'),
  ]);

  const lookProductsEntries = await Promise.all(
    featuredLooks.map(async (look) => {
      const products = await productRepository.findByIds(look.productIds);
      return [look.id, products] as const;
    })
  );
  const lookProducts = Object.fromEntries(lookProductsEntries);

  // Build section elements
  const sectionElements: Record<string, React.ReactNode> = {
    hero: (
      <HeroSection content={{
        video_src: heroContent?.video_src || '/videos/hero-beach.mp4',
        subtitle: heroContent?.subtitle || 'Lolett',
        title_line1: heroContent?.title_line1 || 'Porter &',
        title_line2: heroContent?.title_line2 || 'vibrer le Sud',
        description: heroContent?.description || 'Lolett',
        cta1_text: heroContent?.cta1_text || 'Vestiaire Femme',
        cta1_href: heroContent?.cta1_href || '/shop/femme',
        cta2_text: heroContent?.cta2_text || 'Vestiaire Homme',
        cta2_href: heroContent?.cta2_href || '/shop/homme',
      }} hexColor={hexColor} />
    ),
    new_arrivals: <NewArrivalsSection products={newProducts} hexColor={hexColor} />,
    brand_story: <BrandStorySection content={brandStoryContent} hexColor={hexColor} />,
    looks: <LooksSection looks={featuredLooks} lookProducts={lookProducts} hexColor={hexColor} />,
    newsletter: (
      <NewsletterSection content={{
        title: newsletterContent?.title || 'Reste connecté',
        description: newsletterContent?.description || 'Nouveautés, exclusivités et inspirations du Sud-Ouest.',
        placeholder_text: newsletterContent?.placeholder_text || 'ton@email.com',
        button_text: newsletterContent?.button_text || "S'inscrire",
        disclaimer: newsletterContent?.disclaimer || '',
      }} hexColor={hexColor} />
    ),
  };

  // Get visible sections in order (fallback to all if empty)
  const visibleSections = pageSections.length > 0
    ? pageSections.filter(s => s.visible)
    : [
        { section_key: 'hero' }, { section_key: 'new_arrivals' },
        { section_key: 'brand_story' }, { section_key: 'looks' },
        { section_key: 'newsletter' },
      ];

  return (
    <div
      className="min-h-screen relative font-[family-name:var(--font-montserrat)] text-[#1B0B94]"
      style={{ backgroundColor: hexColor }}
    >
      <main>
        {visibleSections.map((s) => {
          const el = sectionElements[s.section_key];
          if (!el) return null;
          return <Fragment key={s.section_key}>{el}</Fragment>;
        })}
      </main>
    </div>
  );
}
