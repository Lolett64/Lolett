import type { Metadata } from 'next';
import { productRepository, lookRepository } from '@/lib/adapters';
import { getSiteContent } from '@/lib/cms/content';
import { getVisibleSectionKeys } from '@/lib/cms/sections';
import { ShopHero } from '@/components/shop/ShopHero';
import { ShopNewArrivals } from '@/components/shop/ShopNewArrivals';
import { ShopFeaturedLooks } from '@/components/shop/ShopFeaturedLooks';
import { ShopTrustBar } from '@/components/shop/ShopTrustBar';

export const revalidate = 60;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'La Boutique — LOLETT',
  description: 'Explore les collections LOLETT pour homme et femme. Mode du Sud-Ouest, looks complets, livraison offerte dès 100 €.',
  alternates: { canonical: `${BASE_URL}/shop` },
  openGraph: { title: 'La Boutique — LOLETT', description: 'Pour lui, pour elle. Pensé au Sud, porté partout.', url: `${BASE_URL}/shop`, type: 'website' },
};

export default async function ShopPage() {
  const [femmeProducts, hommeProducts, accessoiresProducts, featuredLooks, content, visibleSections] = await Promise.all([
    productRepository.findMany({ gender: 'femme', limit: 2 }),
    productRepository.findMany({ gender: 'homme', limit: 1 }),
    productRepository.findMany({ category: 'accessoires', limit: 1 }),
    lookRepository.findMany({ limit: 3 }),
    getSiteContent('shop'),
    getVisibleSectionKeys('shop'),
  ]);

  const c = (key: string, fallback: string) => content?.[key] || fallback;
  const show = (key: string) => !visibleSections?.length || visibleSections.includes(key);
  const newArrivals = [...femmeProducts.slice(0, 2), ...hommeProducts.slice(0, 1), ...accessoiresProducts.slice(0, 1)];

  const LIN_TEXTURE = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")";

  return (
    <div className="relative min-h-screen text-[#1B0B94]" style={{ backgroundColor: '#FDF5E6' }}>
      {/* Texture lin */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.04]" style={{ backgroundImage: LIN_TEXTURE }} />

      {show('hero') && (
        <ShopHero
          heroBadge={c('hero_badge', 'Collection Été 2026')}
          heroTitle={c('hero_title', 'La Boutique')}
          heroSubtitle={c('hero_subtitle', 'Des pièces pensées pour le Sud. Pour lui, pour elle.')}
          hommeImage={c('homme_image', '/images/chemise-lin-mediterranee.png')}
          hommeLabel={c('homme_label', 'Pour Lui')}
          hommeCategories={c('homme_categories', 'Chemises · Pantalons · Accessoires')}
          femmeImage={c('femme_image', '/images/robe-midi-provencale.png')}
          femmeLabel={c('femme_label', 'Pour Elle')}
          femmeCategories={c('femme_categories', 'Robes · Tops · Accessoires')}
        />
      )}

      {show('new_arrivals') && (
        <ShopNewArrivals
          badge={c('new_arrivals_badge', 'Just in')}
          title={c('new_arrivals_title', 'Nouvelles arrivées')}
          products={newArrivals}
        />
      )}

      {show('looks') && featuredLooks.length > 0 && (
        <ShopFeaturedLooks
          badge={c('looks_badge', 'Prêt à sortir')}
          title={c('looks_title', 'Looks du moment')}
          looks={featuredLooks}
        />
      )}

      {show('trust_bar') && (
        <ShopTrustBar items={[
          { title: c('trust_1_title', 'Livraison offerte'), desc: c('trust_1_desc', "Dès 100€ d'achat en France") },
          { title: c('trust_2_title', 'Retours 14 jours'), desc: c('trust_2_desc', 'Satisfait ou remboursé') },
          { title: c('trust_3_title', 'Qualité premium'), desc: c('trust_3_desc', 'Matières nobles & durables') },
        ]} />
      )}
    </div>
  );
}
