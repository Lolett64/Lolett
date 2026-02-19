/* Variante B — Sable doux + texture lin naturel, ambiance Provence boutique */
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const hommeProducts = [
  { src: '/images/chemise-lin-mediterranee.png', alt: 'Chemise Lin Méditerranée', name: 'Chemise Lin Méditerranée', price: '89€' },
  { src: '/images/polo-pique-riviera.png', alt: 'Polo Piqué Riviera', name: 'Polo Piqué Riviera', price: '75€' },
  { src: '/images/chino-sable.png', alt: 'Chino Sable', name: 'Chino Sable', price: '95€' },
  { src: '/images/bermuda-lin-mistral.png', alt: 'Bermuda Lin Mistral', name: 'Bermuda Lin Mistral', price: '79€' },
  { src: '/images/ceinture-cuir-tresse.jpg', alt: 'Ceinture Cuir Tressé', name: 'Ceinture Cuir Tressé', price: '49€' },
];

const femmeProducts = [
  { src: '/images/robe-midi-provencale.png', alt: 'Robe Midi Provençale', name: 'Robe Midi Provençale', price: '125€' },
  { src: '/images/top-lin-cote-azur.png', alt: "Top Lin Côte d'Azur", name: "Top Lin Côte d'Azur", price: '65€' },
  { src: '/images/blouse-romantique-calanques.jpg', alt: 'Blouse Romantique', name: 'Blouse Romantique Calanques', price: '95€' },
  { src: '/images/jupe-longue-soleil.jpeg', alt: 'Jupe Longue Soleil', name: 'Jupe Longue Soleil', price: '89€' },
  { src: '/images/foulard-soie-mimosa.jpg', alt: 'Foulard Soie Mimosa', name: 'Foulard Soie Mimosa', price: '55€' },
  { src: '/images/panier-plage-tresse.png', alt: 'Panier Plage Tressé', name: 'Panier Plage Tressé', price: '45€' },
];

export default function ShopVB() {
  return (
    <div className="relative min-h-screen bg-[#f3efe8] text-[#2a2520]">

      {/* Texture lin — noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ── HERO asymétrique — image droite / texte gauche ── */}
      <section className="relative pt-24 pb-0 sm:pt-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-2 lg:min-h-[75vh] lg:items-stretch">

            {/* Texte gauche */}
            <div className="flex flex-col justify-center py-12 pr-0 lg:py-0 lg:pr-16">
              <p className="text-[10px] font-medium tracking-wider uppercase text-[#b89840]">
                Été 2026 · Collections
              </p>
              <h1 className="font-display mt-5 text-6xl font-bold leading-tight tracking-tight text-[#2a2520] sm:text-7xl lg:text-8xl">
                La Boutique
              </h1>
              <div className="mt-6 h-px w-16 bg-[#b89840]/40" />
              <p className="mt-6 max-w-[38ch] text-base leading-relaxed text-[#7a6f63]">
                Des matières naturelles, des silhouettes libres. Mode méditerranéenne — pour lui, pour elle.
              </p>

              {/* 2 CTA */}
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/shop/femme"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c4a44e] to-[#b89840] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#c4a44e]/20 transition-all hover:shadow-xl hover:shadow-[#c4a44e]/30"
                >
                  Collection Femme <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/shop/homme"
                  className="inline-flex items-center gap-2 rounded-full border border-[#c4a44e]/40 bg-white/50 px-6 py-3 text-sm font-semibold text-[#2a2520] transition-all hover:border-[#c4a44e] hover:bg-white"
                >
                  Collection Homme <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Petites stats */}
              <div className="mt-12 flex gap-8 border-t border-[#d4c9b8]/50 pt-8">
                {[
                  { val: '4', label: 'Looks complets' },
                  { val: '13+', label: 'Références' },
                  { val: '2', label: 'Collections' },
                ].map((s, i) => (
                  <div key={i}>
                    <p className="font-display text-2xl font-bold text-[#2a2520]">{s.val}</p>
                    <p className="mt-0.5 text-xs text-[#9a8f84]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image droite — découpée sur fond sable */}
            <div className="relative min-h-[55vw] overflow-hidden rounded-2xl lg:min-h-0 lg:rounded-none lg:rounded-tl-[3rem]">
              <Image
                src="/images/robe-midi-provencale.png"
                alt="Collection Femme Été 2026"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* Vignette gauche pour fusionner avec le texte */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#f3efe8]/30 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── COLLECTION HOMME ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium tracking-wider uppercase text-[#b89840]">Pour lui</p>
              <h2 className="font-display mt-2 text-3xl font-bold text-[#2a2520] sm:text-4xl">Collection Homme</h2>
            </div>
            <Link href="/shop/homme" className="flex items-center gap-1 text-sm font-medium text-[#b89840] transition-colors hover:text-[#9a7e38]">
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
            {hommeProducts.map((p, i) => (
              <Link key={i} href="/shop/homme" className="group">
                <div
                  className="relative overflow-hidden bg-[#e8e2d8]"
                  style={{ borderRadius: i === 0 ? '1rem 1rem 1rem 0.25rem' : i === 4 ? '0.25rem 1rem 1rem 1rem' : '0.75rem' }}
                >
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      sizes="(max-width: 640px) 47vw, 20vw"
                    />
                  </div>
                </div>
                <div className="mt-2.5 min-w-0">
                  <p className="truncate text-xs font-medium text-[#2a2520] transition-colors group-hover:text-[#b89840]">{p.name}</p>
                  <p className="mt-0.5 text-xs text-[#9a8f84]">{p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIVIDER éditorial ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-[#d4c9b8]/60" />
          <p className="text-[10px] font-medium tracking-wider uppercase text-[#b89840]">◆</p>
          <div className="h-px flex-1 bg-[#d4c9b8]/60" />
        </div>
      </div>

      {/* ── COLLECTION FEMME ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium tracking-wider uppercase text-[#b89840]">Pour elle</p>
              <h2 className="font-display mt-2 text-3xl font-bold text-[#2a2520] sm:text-4xl">Collection Femme</h2>
            </div>
            <Link href="/shop/femme" className="flex items-center gap-1 text-sm font-medium text-[#b89840] transition-colors hover:text-[#9a7e38]">
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Grille asymétrique femme — 1 grande + 5 petites */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {/* Grande carte hero */}
            <Link href="/shop/femme" className="group col-span-2 sm:col-span-1 lg:col-span-2 lg:row-span-2">
              <div className="relative overflow-hidden rounded-2xl bg-[#e8e2d8] lg:aspect-auto lg:h-full">
                <div className="relative aspect-[3/4]">
                  <Image
                    src="/images/robe-midi-provencale.png"
                    alt="Robe Midi Provençale"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 33vw, 28vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <p className="text-xs font-semibold text-white">Robe Midi Provençale</p>
                    <p className="mt-0.5 text-xs text-white/60">125€</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* 4 petites cartes */}
            {femmeProducts.slice(1, 5).map((p, i) => (
              <Link key={i} href="/shop/femme" className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#e8e2d8]">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    sizes="(max-width: 640px) 47vw, 20vw"
                  />
                </div>
                <div className="mt-2 min-w-0">
                  <p className="truncate text-xs font-medium text-[#2a2520] transition-colors group-hover:text-[#b89840]">{p.name}</p>
                  <p className="mt-0.5 text-xs text-[#9a8f84]">{p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOOKS ── */}
      <section className="bg-[#2a2520] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-[10px] font-medium tracking-wider uppercase text-[#b89840]">Style complet</p>
            <h2 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">Looks du moment</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { src: '/images/chemise-lin-mediterranee.png', title: 'Le Méditerranéen', pieces: '4 pièces', gender: 'Homme' },
              { src: '/images/polo-pique-riviera.png', title: 'Le Riviera Décontracté', pieces: '4 pièces', gender: 'Homme' },
              { src: '/images/robe-midi-provencale.png', title: 'La Provençale', pieces: '3 pièces', gender: 'Femme' },
              { src: '/images/blouse-romantique-calanques.jpg', title: 'La Bohème Azuréenne', pieces: '4 pièces', gender: 'Femme' },
            ].map((look, i) => (
              <Link key={i} href="/looks" className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#1a1510]">
                  <Image
                    src={look.src}
                    alt={look.title}
                    fill
                    className="object-cover opacity-80 transition-all duration-700 group-hover:scale-[1.04] group-hover:opacity-90"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 47vw, 23vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[10px] font-medium tracking-wider uppercase text-[#b89840]">{look.gender}</p>
                    <p className="mt-1 text-sm font-bold text-white">{look.title}</p>
                    <p className="mt-0.5 text-xs text-white/50">{look.pieces}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/looks" className="inline-flex items-center gap-2 rounded-full border border-[#b89840]/40 px-6 py-3 text-sm font-medium text-[#b89840] transition-all hover:border-[#b89840] hover:bg-[#b89840]/10">
              Adopter un look complet <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { title: 'Livraison offerte', desc: "Dès 100€ d'achat en France" },
              { title: 'Retours 30 jours', desc: 'Satisfait ou remboursé' },
              { title: 'Qualité premium', desc: 'Matières nobles & durables' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl bg-white/60 px-6 py-5 text-center shadow-sm backdrop-blur-sm">
                <div className="mx-auto mb-2.5 h-px w-8 bg-[#b89840]/50" />
                <p className="text-sm font-semibold text-[#2a2520]">{item.title}</p>
                <p className="mt-1 text-xs text-[#9a8f84]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
