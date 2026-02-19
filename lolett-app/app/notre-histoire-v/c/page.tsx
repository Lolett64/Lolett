/* Version C — Manifeste typographique : texte roi, style Kinfolk/magazine papier */
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HistoireVC() {
  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#1a1510]">

      {/* ── HERO — typographique, pas d'image ── */}
      <section className="relative border-b border-[#e5e0d5] pt-32 pb-20 sm:pt-44 sm:pb-28">
        {/* Numéro de page décoratif */}
        <span className="pointer-events-none absolute top-36 right-8 font-display text-[18vw] font-bold leading-none text-[#e8e3d9] select-none sm:right-16">
          01
        </span>

        <div className="relative mx-auto max-w-5xl px-6">
          <div className="flex items-start gap-6">
            <div className="mt-3 flex flex-col items-center gap-1">
              <div className="h-8 w-px bg-[#c4a44e]" />
              <p className="vertical-rl rotate-180 text-[9px] font-medium tracking-wider uppercase text-[#c4a44e]"
                 style={{ writingMode: 'vertical-rl' }}>
                Notre Histoire
              </p>
            </div>
            <div className="flex-1">
              <h1 className="font-display text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                On mérite tous<br />d&apos;être bien habillés<br />
                <em className="font-display italic text-[#c4a44e]">sans y passer</em><br />
                trois heures.
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTRO — grand corps, style essai ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[280px_1fr]">
            {/* Sidebar */}
            <div className="lg:pt-2">
              <div className="sticky top-28">
                <p className="text-[10px] font-medium tracking-wider uppercase text-[#c4a44e]">LOLETT</p>
                <p className="mt-3 text-xs text-[#9a8f84]">Fondée au bord de la Méditerranée. Portée partout.</p>
                <div className="mt-6 h-px bg-[#e5e0d5]" />
                <div className="relative mt-6 aspect-[3/4] overflow-hidden rounded-xl bg-[#e8e3d9]">
                  <Image
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=85"
                    alt="Fondatrice LOLETT"
                    fill
                    className="object-cover"
                    sizes="280px"
                  />
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="max-w-2xl space-y-10">
              <div>
                <span className="font-display text-6xl font-bold leading-none text-[#e8e3d9]">I.</span>
                <p className="mt-4 text-2xl font-medium leading-relaxed text-[#1a1510] sm:text-3xl">
                  Je sélectionne chaque pièce comme si c&apos;était pour moi.
                </p>
                <p className="mt-5 text-base leading-relaxed text-[#5a4f45]">
                  Des coupes qui tombent bien, des matières qu&apos;on a envie de toucher, et des prix qui ne font pas grimacer. Ici, pas de tendances éphémères ni de collections à rallonge.
                </p>
              </div>

              <div className="border-l-2 border-[#c4a44e]/30 pl-8">
                <p className="text-xl italic leading-relaxed text-[#1a1510]">
                  &laquo;&thinsp;Juste des pièces qui fonctionnent ensemble, pour que tu sortes de chez toi en te disant — ouais, je suis bien là.&thinsp;&raquo;
                </p>
              </div>

              <div>
                <span className="font-display text-6xl font-bold leading-none text-[#e8e3d9]">II.</span>
                <p className="mt-4 text-2xl font-medium leading-relaxed text-[#1a1510] sm:text-3xl">
                  La plupart des sites te vendent des pièces. Nous, on te propose des looks complets.
                </p>
                <p className="mt-5 text-base leading-relaxed text-[#5a4f45]">
                  Une chemise en lin qui va avec ce chino, cette ceinture et ces chaussures. Tu ajoutes tout d&apos;un clic, et tu es prêt.
                </p>
                <p className="mt-4 text-sm italic text-[#9a8f84]">
                  C&apos;est comme avoir une amie styliste — sauf que tu peux le faire en pyjama.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MATIÈRES — texte + image côte à côte ── */}
      <section className="border-t border-[#e5e0d5] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
            {/* Texte */}
            <div>
              <span className="font-display text-6xl font-bold leading-none text-[#e8e3d9]">III.</span>
              <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Nos matières</h2>
              <p className="mt-3 text-[10px] font-medium tracking-wider uppercase text-[#c4a44e]">Ce qu&apos;on choisit</p>

              <div className="mt-10 space-y-8">
                {[
                  { title: 'Lin français', text: 'Respirant, naturel, qui s\'adoucit à chaque lavage. Le tissu du Sud par excellence.' },
                  { title: 'Coton premium', text: 'Doux, résistant, 180g minimum. Pas de tissu qui se déforme au deuxième lavage.' },
                  { title: 'Viscose souple', text: 'Fluide, élégante, parfaite pour les robes et les chemises qui dansent au vent.' },
                ].map((m, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#c4a44e]" />
                    <div>
                      <p className="font-semibold text-[#1a1510]">{m.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#7a6f63]">{m.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-10 text-sm italic text-[#9a8f84]">
                Parce que le vrai luxe, c&apos;est ce qu&apos;on porte vraiment.
              </p>
            </div>

            {/* Mosaïque images */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { src: '/images/chemise-lin-mediterranee.png', alt: 'Lin Méditerranée', cls: 'row-span-2' },
                { src: '/images/robe-midi-provencale.png', alt: 'Robe Provençale', cls: '' },
                { src: '/images/polo-pique-riviera.png', alt: 'Polo Riviera', cls: '' },
              ].map((img, i) => (
                <div key={i} className={`relative overflow-hidden rounded-xl bg-[#e8e3d9] ${img.cls}`}>
                  <div className={`relative ${i === 0 ? 'aspect-[2/3]' : 'aspect-square'}`}>
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 45vw, 22vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA — sobre, crème ── */}
      <section className="border-t border-[#e5e0d5] bg-white py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="font-display text-6xl font-bold leading-none text-[#f0ece4]">IV.</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Installe-toi, regarde,<br />et si tu craques…
          </h2>
          <p className="mt-4 text-sm italic text-[#9a8f84]">On t&apos;avait prévenu.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/shop/femme" className="inline-flex items-center gap-2 rounded-full bg-[#1a1510] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#c4a44e]">
              Shop Femme <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/shop/homme" className="inline-flex items-center gap-2 rounded-full border border-[#d5cfc5] px-8 py-3.5 text-sm font-semibold text-[#1a1510] transition-all hover:border-[#c4a44e]">
              Shop Homme <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
