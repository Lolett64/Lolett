import type { Metadata } from 'next';
import {
  HeroSection,
  NewArrivalsSection,
  LooksSection,
  BrandStorySection,
  NewsletterSection,
} from '@/components/sections/home-v3';
import { productRepository, lookRepository } from '@/lib/adapters';
import { getSiteContent } from '@/lib/cms/content';

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

// Revalidate every 60s so admin CMS changes appear quickly
export const revalidate = 60;

const hexColor = "#FDF5E6";

export default async function HomePage() {
  const [heroContent, newsletterContent, brandStoryContent, newProducts, featuredLooks] = await Promise.all([
    getSiteContent('hero'),
    getSiteContent('newsletter'),
    getSiteContent('brand_story'),
    productRepository.findMany({ isNew: true }).then((p) => p.slice(0, 4)),
    lookRepository.findMany().then((l) => l.slice(0, 3)),
  ]);

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

        {/* Thin gold divider */}
        <div className="flex items-center justify-center py-1" style={{ backgroundColor: hexColor }}>
          <span className="w-px h-12 bg-[#B89547]/20" />
        </div>

        <NewArrivalsSection products={newProducts} hexColor={hexColor} />
        <BrandStorySection content={brandStoryContent} hexColor={hexColor} />
        <LooksSection looks={featuredLooks} lookProducts={lookProducts} hexColor={hexColor} />
        <NewsletterSection content={{
          title: newsletterContent?.title || 'Reste connecté',
          description: newsletterContent?.description || 'Nouveautés, exclusivités et inspirations du Sud-Ouest.',
          placeholder_text: newsletterContent?.placeholder_text || 'ton@email.com',
          button_text: newsletterContent?.button_text || "S'inscrire",
          disclaimer: newsletterContent?.disclaimer || '',
        }} hexColor={hexColor} />
      </main>
    </div>
  );
}
