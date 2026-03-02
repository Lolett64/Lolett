import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'La Boutique — LOLETT',
  description:
    'Explore les collections LOLETT pour homme et femme. Mode du Sud-Ouest, looks complets, livraison offerte dès 100 €.',
  alternates: { canonical: `${BASE_URL}/shop` },
  openGraph: {
    title: 'La Boutique — LOLETT',
    description: 'Pour lui, pour elle. Pensé au Sud, porté partout.',
    url: `${BASE_URL}/shop`,
    type: 'website',
  },
};

const hommeProducts = [
  { src: '/images/chemise-lin-mediterranee.png', alt: 'Chemise Lin Sud-Ouest', name: 'Chemise Lin Sud-Ouest', price: '89€' },
  { src: '/images/polo-pique-riviera.png', alt: 'Polo Piqué Riviera', name: 'Polo Piqué Riviera', price: '75€' },
  { src: '/images/chino-sable.png', alt: 'Chino Sable', name: 'Chino Sable', price: '95€' },
  { src: '/images/bermuda-lin-mistral.png', alt: 'Bermuda Lin Mistral', name: 'Bermuda Lin Mistral', price: '79€' },
];

const femmeProducts = [
  { src: '/images/robe-midi-provencale.png', alt: 'Robe Midi Provençale', name: 'Robe Midi Provençale', price: '125€' },
  { src: '/images/top-lin-cote-azur.png', alt: "Top Lin Côte d'Azur", name: "Top Lin Côte d'Azur", price: '65€' },
  { src: '/images/blouse-romantique-calanques.jpg', alt: 'Blouse Romantique Calanques', name: 'Blouse Romantique Calanques', price: '95€' },
  { src: '/images/jupe-longue-soleil.jpeg', alt: 'Jupe Longue Soleil', name: 'Jupe Longue Soleil', price: '89€' },
];

const categories = [
  { name: 'Chemises', href: '/shop/homme' },
  { name: 'Pantalons', href: '/shop/homme' },
  { name: 'Robes', href: '/shop/femme' },
  { name: 'Tops', href: '/shop/femme' },
  { name: 'Accessoires', href: '/shop/homme' },
  { name: 'Lookbooks', href: '/looks' },
];

export default function ShopPage() {
  return (
    <div className="relative min-h-screen text-[#1B0B94]" style={{ backgroundColor: '#FDF5E6' }}>

      {/* Texture lin */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ── HERO — 3 colonnes éditoriales ── */}
      <section className="relative overflow-hidden pt-4 pb-0 sm:pt-6">

        <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6">
          <p className="mb-8 text-center text-[10px] font-medium tracking-wider uppercase text-[#1B0B94]">
            Collection Été 2026
          </p>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px_1fr] lg:items-stretch lg:gap-6">

            {/* Card HOMME */}
            <Link href="/shop/homme" className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#ede9e1] sm:aspect-[3/4]">
                <Image
                  src="/images/chemise-lin-mediterranee.png"
                  alt="Collection Homme LOLETT"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width: 1024px) 90vw, 42vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-8">
                  <p className="text-[10px] font-medium tracking-wider uppercase text-[#1B0B94]">Pour Lui</p>
                  <h2 className="font-display mt-1 text-3xl font-bold text-white sm:text-4xl">Homme</h2>
                  <p className="mt-1 text-sm text-white/55">Chemises · Pantalons · Accessoires</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-white transition-colors duration-300 group-hover:text-[#1B0B94]">
                    Découvrir <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Colonne centrale — titre */}
            <div className="flex flex-col items-center justify-center py-8 text-center lg:py-0">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#1B0B94] to-transparent" />
              <h1 className="font-display mt-6 text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
                La Boutique
              </h1>
              <div className="mt-6 h-px w-12 bg-gradient-to-r from-transparent via-[#1B0B94] to-transparent" />
              <p className="mt-5 max-w-[16ch] text-sm leading-relaxed text-[#4a3f35]">
                Des pièces pensées pour le Sud. Pour lui, pour elle.
              </p>
              <div className="mt-8 hidden text-[10px] font-medium tracking-wider uppercase text-[#130970] lg:block">
                ↓ Explorer
              </div>
            </div>

            {/* Card FEMME */}
            <Link href="/shop/femme" className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#ede9e1] sm:aspect-[3/4]">
                <Image
                  src="/images/robe-midi-provencale.png"
                  alt="Collection Femme LOLETT"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width: 1024px) 90vw, 42vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-8">
                  <p className="text-[10px] font-medium tracking-wider uppercase text-[#1B0B94]">Pour Elle</p>
                  <h2 className="font-display mt-1 text-3xl font-bold text-white sm:text-4xl">Femme</h2>
                  <p className="mt-1 text-sm text-white/55">Robes · Tops · Accessoires</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-white transition-colors duration-300 group-hover:text-[#1B0B94]">
                    Découvrir <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>


      {/* ── NOUVELLES ARRIVÉES ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium tracking-wider uppercase text-[#130970]">Just in</p>
              <h2 className="font-display mt-2 text-3xl font-bold text-[#1e1610] sm:text-4xl">Nouvelles arrivées</h2>
            </div>
            <Link
              href="/nouveautes"
              className="hidden items-center gap-1 text-sm font-semibold text-[#4a3f35] transition-colors hover:text-[#130970] sm:flex"
            >
              Tout voir <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
            {[...hommeProducts.slice(0, 2), ...femmeProducts.slice(0, 2)].map((p, i) => (
              <Link key={i} href="/shop" className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#e8e2d8]">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 47vw, 23vw"
                  />
                </div>
                <div className="mt-3 min-w-0">
                  <p className="truncate text-sm font-semibold text-[#1e1610] transition-colors group-hover:text-[#130970]">
                    {p.name}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-[#7a6f63]">{p.price}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/nouveautes" className="inline-flex items-center gap-1 text-sm font-medium text-[#130970]">
              Voir toutes les nouveautés <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── LOOKS ÉDITORIAUX ── */}
      <section className="bg-[#ebe5d9] py-16 sm:py-24">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium tracking-wider uppercase text-[#130970]">Prêt à sortir</p>
              <h2 className="font-display mt-2 text-3xl font-bold text-[#1e1610] sm:text-4xl">Looks du moment</h2>
            </div>
            <Link
              href="/looks"
              className="hidden items-center gap-1 text-sm font-semibold text-[#4a3f35] transition-colors hover:text-[#130970] sm:flex"
            >
              Tous les looks <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Link href="/looks" className="group sm:col-span-2">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#e5ddd2]">
                <Image
                  src="/images/polo-pique-riviera.png"
                  alt="Le Riviera Décontracté"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 90vw, 60vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-[10px] font-medium tracking-wider uppercase text-[#1B0B94]">Look Homme</p>
                  <h3 className="font-display mt-1 text-2xl font-bold text-white">Le Riviera Décontracté</h3>
                  <p className="mt-1 text-xs text-white/60">4 pièces · Polo · Bermuda · Casquette · Ceinture</p>
                </div>
              </div>
            </Link>

            <Link href="/looks" className="group">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#e5ddd2]">
                <Image
                  src="/images/blouse-romantique-calanques.jpg"
                  alt="La Bohème Azuréenne"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 90vw, 30vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-[10px] font-medium tracking-wider uppercase text-[#1B0B94]">Look Femme</p>
                  <h3 className="font-display mt-1 text-xl font-bold text-white">La Bohème Azuréenne</h3>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="border-t border-[#d9d0c0] py-14">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
            {[
              { title: 'Livraison offerte', desc: "Dès 100€ d'achat en France" },
              { title: 'Retours 14 jours', desc: 'Satisfait ou remboursé' },
              { title: 'Qualité premium', desc: 'Matières nobles & durables' },
            ].map((item, i) => (
              <div key={i}>
                <div className="mx-auto mb-3 h-px w-8 bg-[#1B0B94]" />
                <p className="text-sm font-bold text-[#1e1610]">{item.title}</p>
                <p className="mt-1 text-xs font-medium text-[#6a5f55]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
