/* Variante D — Bicolore : hero sombre + section blanche, rupture nette */
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight } from 'lucide-react';

const hommeProducts = [
  { src: '/images/chemise-lin-mediterranee.png', alt: 'Chemise Lin Méditerranée', name: 'Chemise Lin Méditerranée', price: '89€' },
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

export default function ShopVD() {
  return (
    <div className="min-h-screen">

      {/* ══════════════════════════════════════
          ZONE SOMBRE — Hero cinématique
      ══════════════════════════════════════ */}
      <section className="relative min-h-[85vh] overflow-hidden bg-[#111010] pt-24 sm:pt-0">
        {/* Glow doré centré */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(196,164,78,0.07),transparent_65%)]" />
        </div>

        {/* SVG décoratif coins */}
        <svg className="pointer-events-none absolute top-8 right-8 h-40 w-40 opacity-[0.06]" viewBox="0 0 160 160" fill="none">
          <rect x="1" y="1" width="158" height="158" rx="12" stroke="#c4a44e" strokeWidth="0.6" />
          <rect x="12" y="12" width="136" height="136" rx="8" stroke="#c4a44e" strokeWidth="0.4" />
          <line x1="80" y1="1" x2="80" y2="159" stroke="#c4a44e" strokeWidth="0.3" />
          <line x1="1" y1="80" x2="159" y2="80" stroke="#c4a44e" strokeWidth="0.3" />
        </svg>
        <svg className="pointer-events-none absolute bottom-8 left-8 h-28 w-28 opacity-[0.05]" viewBox="0 0 112 112" fill="none">
          <circle cx="56" cy="56" r="50" stroke="#c4a44e" strokeWidth="0.5" />
          <circle cx="56" cy="56" r="35" stroke="#c4a44e" strokeWidth="0.4" />
          <circle cx="56" cy="56" r="18" stroke="#c4a44e" strokeWidth="0.3" />
        </svg>

        {/* Layout plein écran — texte gauche / images droite */}
        <div className="relative mx-auto flex h-full min-h-[85vh] max-w-7xl flex-col items-center justify-center gap-12 px-4 py-20 sm:px-6 lg:flex-row lg:py-0">

          {/* Texte */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-[10px] font-medium tracking-wider uppercase text-[#c4a44e]/80">
              Collection Été 2026
            </p>
            <h1 className="font-display mt-5 text-6xl font-bold leading-tight tracking-tight text-white sm:text-7xl lg:text-8xl">
              La Boutique
            </h1>
            <div className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-[#c4a44e] to-transparent lg:mx-0" />
            <p className="mx-auto mt-6 max-w-[40ch] text-base leading-relaxed text-[#888] lg:mx-0">
              Mode méditerranéenne pour lui et pour elle. Des pièces en lin, des looks pensés pour le Sud.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link
                href="/shop/femme"
                className="inline-flex items-center gap-2 rounded-full bg-[#c4a44e] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#b08e3a]"
              >
                Shop Femme <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/shop/homme"
                className="inline-flex items-center gap-2 rounded-full border border-[#333] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:border-[#c4a44e]/50"
              >
                Shop Homme <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-14 flex justify-center gap-10 border-t border-[#222] pt-10 lg:justify-start">
              {[
                { val: '4', label: 'Looks' },
                { val: '13+', label: 'Pièces' },
                { val: '2', label: 'Collections' },
              ].map((s, i) => (
                <div key={i} className="text-center lg:text-left">
                  <p className="font-display text-3xl font-bold text-white">{s.val}</p>
                  <p className="mt-0.5 text-xs text-[#555]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mosaïque produits — sombre */}
          <div className="grid w-full max-w-sm grid-cols-2 gap-3 lg:max-w-md">
            {[
              { src: '/images/chemise-lin-mediterranee.png', alt: 'Chemise', tall: true },
              { src: '/images/robe-midi-provencale.png', alt: 'Robe', tall: false },
              { src: '/images/polo-pique-riviera.png', alt: 'Polo', tall: false },
              { src: '/images/blouse-romantique-calanques.jpg', alt: 'Blouse', tall: true },
            ].map((p, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-xl bg-[#1e1c18]"
                style={{ aspectRatio: p.tall ? '3/5' : '4/3' }}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  className="object-cover opacity-85"
                  sizes="(max-width: 640px) 40vw, 20vw"
                />
                {/* Reflet doré subtil en bas */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#c4a44e]/10 to-transparent" />
              </div>
            ))}
          </div>
        </div>

        {/* Indicateur de scroll */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#444]">
          <p className="text-[10px] tracking-wider uppercase">Collections</p>
          <div className="h-6 w-px bg-gradient-to-b from-[#444] to-transparent" />
        </div>
      </section>

      {/* ══════════════════════════════════════
          RUPTURE NETTE → ZONE BLANCHE
      ══════════════════════════════════════ */}

      {/* ── NAVIGATION GENRES ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[
              { title: 'Homme', href: '/shop/homme', sub: 'Chemises · Pantalons · Accessoires', src: '/images/chino-sable.png', accent: '#1a1a1a' },
              { title: 'Femme', href: '/shop/femme', sub: 'Robes · Tops · Accessoires', src: '/images/top-lin-cote-azur.png', accent: '#c4a44e' },
            ].map((col) => (
              <Link key={col.title} href={col.href} className="group">
                <div className="overflow-hidden rounded-2xl border border-[#eee] transition-all duration-500 group-hover:border-[#c4a44e]/40 group-hover:shadow-2xl">
                  <div className="grid grid-cols-2 gap-0">
                    {/* Image principale */}
                    <div className="relative col-span-2 aspect-[2/1] overflow-hidden bg-[#f5f2ec]">
                      <Image
                        src={col.src}
                        alt={`Collection ${col.title}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 90vw, 45vw"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-6 py-5 sm:px-7">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-[#1a1a1a] sm:text-3xl">{col.title}</h2>
                      <p className="mt-1 text-sm text-[#aaa]">{col.sub}</p>
                    </div>
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300"
                      style={{ background: col.accent }}
                    >
                      <ArrowRight className="h-5 w-5 text-white transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOUVELLES ARRIVÉES ── sur fond blanc */}
      <section className="bg-white pb-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Titre avec ligne */}
          <div className="mb-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#eee]" />
            <div>
              <p className="text-center text-[10px] font-medium tracking-wider uppercase text-[#c4a44e]">Just in</p>
              <h2 className="font-display mt-1 text-center text-2xl font-bold text-[#1a1a1a]">Nouvelles arrivées</h2>
            </div>
            <div className="h-px flex-1 bg-[#eee]" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
            {[...hommeProducts.slice(0, 2), ...femmeProducts.slice(0, 2)].map((p, i) => (
              <Link key={i} href="/shop" className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#f5f2ec]">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 47vw, 23vw"
                  />
                </div>
                <div className="mt-3 min-w-0">
                  <p className="truncate text-sm font-medium text-[#1a1a1a] transition-colors group-hover:text-[#c4a44e]">{p.name}</p>
                  <p className="mt-0.5 text-sm text-[#bbb]">{p.price}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/nouveautes" className="inline-flex items-center gap-1 text-sm font-medium text-[#1a1a1a] transition-colors hover:text-[#c4a44e]">
              Toutes les nouveautés <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── LOOKS — retour au sombre ── */}
      <section className="bg-[#111010] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium tracking-wider uppercase text-[#c4a44e]">Prêt à sortir</p>
              <h2 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">Looks du moment</h2>
            </div>
            <Link href="/looks" className="hidden items-center gap-1 text-sm font-medium text-[#c4a44e] hover:text-[#b08e3a] sm:flex">
              Tous les looks <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { src: '/images/chemise-lin-mediterranee.png', title: 'Le Méditerranéen', genre: 'Homme', pieces: '4 pièces' },
              { src: '/images/polo-pique-riviera.png', title: 'Le Riviera Décontracté', genre: 'Homme', pieces: '4 pièces' },
              { src: '/images/robe-midi-provencale.png', title: 'La Provençale', genre: 'Femme', pieces: '3 pièces' },
              { src: '/images/blouse-romantique-calanques.jpg', title: 'La Bohème Azuréenne', genre: 'Femme', pieces: '4 pièces' },
            ].map((look, i) => (
              <Link key={i} href="/looks" className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#1e1c18]">
                  <Image
                    src={look.src}
                    alt={look.title}
                    fill
                    className="object-cover opacity-80 transition-all duration-700 group-hover:scale-[1.04] group-hover:opacity-100"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 47vw, 23vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-[10px] font-medium tracking-wider uppercase text-[#c4a44e]">{look.genre}</p>
                    <p className="mt-1 text-sm font-bold text-white">{look.title}</p>
                    <p className="mt-0.5 text-xs text-white/50">{look.pieces}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST — fond sable léger ── */}
      <section className="bg-[#f5f2ec]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-px border-y border-[#e5e0d8] sm:grid-cols-3">
          {[
            { title: 'Livraison offerte', desc: "Dès 100€ d'achat en France" },
            { title: 'Retours 30 jours', desc: 'Satisfait ou remboursé' },
            { title: 'Qualité premium', desc: 'Matières nobles & durables' },
          ].map((item, i) => (
            <div key={i} className="bg-[#f5f2ec] px-8 py-10 text-center">
              <div className="mx-auto mb-3 h-px w-8 bg-[#c4a44e]/50" />
              <p className="text-sm font-semibold text-[#1a1a1a]">{item.title}</p>
              <p className="mt-1 text-xs text-[#999]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
