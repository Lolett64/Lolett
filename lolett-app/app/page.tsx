import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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

const hexColor = "#FDF5E6";

export default async function HomePage() {
  const [heroContent, newsletterContent, newProducts, featuredLooks] = await Promise.all([
    getSiteContent('hero'),
    getSiteContent('newsletter'),
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
          description: heroContent?.description || 'Pour lui, pour elle, pour vous.',
          cta1_text: heroContent?.cta1_text || 'Vestiaire Femme',
          cta1_href: heroContent?.cta1_href || '/shop/femme',
          cta2_text: heroContent?.cta2_text || 'Vestiaire Homme',
          cta2_href: heroContent?.cta2_href || '/shop/homme',
        }} hexColor={hexColor} />
        {/* <CollectionsSection content={content} hexColor={hexColor} /> */}
        <NewArrivalsSection products={newProducts} hexColor={hexColor} />
        <BrandStorySection hexColor={hexColor} />
        <LooksSection looks={featuredLooks} lookProducts={lookProducts} hexColor={hexColor} />
        <TestimonialsSection reviews={reviews} hexColor={hexColor} />
        <NewsletterSection content={{
          title: newsletterContent?.title || 'Reste connecté',
          description: newsletterContent?.description || 'Nouveautés, exclusivités et inspirations du Sud-Ouest.',
          placeholder_text: newsletterContent?.placeholder_text || 'ton@email.com',
          button_text: newsletterContent?.button_text || "S'inscrire",
          disclaimer: newsletterContent?.disclaimer || '',
        }} hexColor={hexColor} />

        {/* CTA Final */}
        <section className="relative bg-[#0B0F1A] text-white py-20 md:py-28 text-center overflow-hidden">
          <div className="max-w-3xl mx-auto px-6">
            <span className="text-[#B89547] text-[10px] uppercase tracking-[0.4em] font-medium mb-6 block">
              Prêt ?
            </span>
            <h2 className="font-[family-name:var(--font-newsreader)] text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Installe-toi, regarde, et si tu craques...
            </h2>
            <p className="text-white/60 italic text-lg mb-10">
              On t&apos;avait prévenu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop/femme" className="inline-flex items-center justify-center gap-2 bg-[#B89547] text-[#0B0F1A] px-8 py-4 text-sm uppercase tracking-[0.2em] font-bold hover:bg-[#B89547]/90 transition-colors">
                Shop Femme <ArrowRight size={16} />
              </Link>
              <Link href="/shop/homme" className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-4 text-sm uppercase tracking-[0.2em] font-bold hover:bg-white/10 transition-colors">
                Shop Homme <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-6 text-center" style={{ backgroundColor: hexColor }}>
          <p className="text-[#1B0B94]/40 text-sm italic font-[family-name:var(--font-newsreader)]">
            LOLETT décline toute responsabilité en cas de coup de coeur.
          </p>
        </section>
      </main>
    </div>
  );
}
