import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Notre Histoire — LOLETT',
  description:
    'LOLETT est née d\'une évidence : on mérite tous d\'être bien habillés sans y passer trois heures. Découvrez notre histoire, pensée au Sud.',
};

export default function NotreHistoirePage() {
  return (
    <div className="relative min-h-screen bg-[#f3efe8] text-[#1a1510]">

      {/* Texture lin */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ══ HERO (Version A) — titre monumental sur fond sable ══ */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-44 sm:pb-28">
        {/* Hairline centrale */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-[#c4a44e]/[0.08]" />
        </div>

        {/* Numéro décoratif */}
        <span className="pointer-events-none absolute top-24 right-6 select-none font-display text-[22vw] font-bold leading-none text-[#ede8e0] sm:right-12">
          01
        </span>

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <p className="text-[10px] font-medium tracking-wider uppercase text-[#b89840]">Notre Histoire</p>
          <h1 className="font-display mt-6 text-6xl font-bold leading-tight tracking-tight text-[#1e1610] sm:text-7xl lg:text-8xl">
            LOLETT
          </h1>
          <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-[#c4a44e] to-transparent" />
          <p className="mx-auto mt-8 max-w-[52ch] text-xl leading-relaxed text-[#4a3f35] sm:text-2xl">
            C&apos;est parti d&apos;une idée simple — on mérite tous d&apos;être bien habillés sans y passer trois heures.
          </p>
        </div>
      </section>

      {/* ══ INTRO (Version C) — sidebar + contenu éditorial ══ */}
      <section className="border-t border-[#d9d0c0] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[280px_1fr]">

            {/* Sidebar sticky */}
            <div>
              <div className="lg:sticky lg:top-28">
                <p className="text-[10px] font-medium tracking-wider uppercase text-[#b89840]">LOLETT</p>
                <p className="mt-3 text-xs text-[#7a6f63]">Fondée au bord de la Méditerranée. Portée partout.</p>
                <div className="mt-6 h-px bg-[#d9d0c0]" />
                <div className="relative mt-6 aspect-[3/4] overflow-hidden rounded-2xl bg-[#e8e2d8]">
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
            <div className="max-w-2xl space-y-14">

              {/* I. */}
              <div>
                <span className="font-display text-6xl font-bold leading-none text-[#e8e2d8]">I.</span>
                <p className="mt-4 text-2xl font-semibold leading-relaxed text-[#1a1510] sm:text-3xl">
                  Je sélectionne chaque pièce comme si c&apos;était pour moi.
                </p>
                <p className="mt-5 text-base leading-relaxed text-[#5a4f45]">
                  Des coupes qui tombent bien, des matières qu&apos;on a envie de toucher, et des prix qui ne font pas grimacer. Ici, pas de tendances éphémères ni de collections à rallonge.
                </p>
              </div>

              {/* Citation */}
              <div className="border-l-2 border-[#c4a44e]/40 pl-8">
                <p className="text-xl italic leading-relaxed text-[#1a1510]">
                  &laquo;&thinsp;Juste des pièces qui fonctionnent ensemble, pour que tu sortes de chez toi en te disant — ouais, je suis bien là.&thinsp;&raquo;
                </p>
              </div>

              {/* II. */}
              <div>
                <span className="font-display text-6xl font-bold leading-none text-[#e8e2d8]">II.</span>
                <p className="mt-4 text-2xl font-semibold leading-relaxed text-[#1a1510] sm:text-3xl">
                  La plupart des sites te vendent des pièces. Nous, on te propose des looks complets.
                </p>
                <p className="mt-5 text-base leading-relaxed text-[#5a4f45]">
                  Une chemise en lin qui va avec ce chino, cette ceinture et ces chaussures. Tu ajoutes tout d&apos;un clic, et tu es prêt.
                </p>
                <p className="mt-4 text-sm italic text-[#9a8f84]">
                  C&apos;est comme avoir une amie styliste qui te dit &laquo;&thinsp;fais-moi confiance, prends ça&thinsp;&raquo;. Sauf que c&apos;est un site, et tu peux le faire en pyjama.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ MATIÈRES (Version C) — texte + mosaïque ══ */}
      <section className="border-t border-[#d9d0c0] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">

            {/* Texte */}
            <div>
              <span className="font-display text-6xl font-bold leading-none text-[#e8e2d8]">III.</span>
              <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Nos matières</h2>
              <p className="mt-2 text-[10px] font-medium tracking-wider uppercase text-[#b89840]">Ce qu&apos;on choisit</p>

              <div className="mt-10 space-y-8">
                {[
                  { title: 'Lin français', text: 'Respirant, naturel, qui s\'adoucit à chaque lavage. Le tissu du Sud par excellence.' },
                  { title: 'Coton premium', text: 'Doux, résistant, 180g minimum. Pas de tissu qui se déforme au deuxième lavage.' },
                  { title: 'Viscose souple', text: 'Fluide, élégante, parfaite pour les robes et les chemises qui dansent au vent.' },
                ].map((m, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#c4a44e]" />
                    <div>
                      <p className="font-bold text-[#1a1510]">{m.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#7a6f63]">{m.text}</p>
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
              <div className="relative row-span-2 overflow-hidden rounded-2xl bg-[#e8e2d8]">
                <div className="relative aspect-[2/3]">
                  <Image
                    src="/images/chemise-lin-mediterranee.png"
                    alt="Lin Méditerranée"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 45vw, 22vw"
                  />
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl bg-[#e8e2d8]">
                <div className="relative aspect-square">
                  <Image
                    src="/images/robe-midi-provencale.png"
                    alt="Robe Provençale"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 45vw, 22vw"
                  />
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl bg-[#e8e2d8]">
                <div className="relative aspect-square">
                  <Image
                    src="/images/polo-pique-riviera.png"
                    alt="Polo Riviera"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 45vw, 22vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA (Version C) — sobre, fond blanc ══ */}
      <section className="border-t border-[#d9d0c0] bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="font-display text-6xl font-bold leading-none text-[#f0ece4]">IV.</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Installe-toi, regarde,<br />et si tu craques…
          </h2>
          <p className="mt-4 text-sm italic text-[#9a8f84]">On t&apos;avait prévenu.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/shop/femme"
              className="inline-flex items-center gap-2 rounded-full bg-[#1a1510] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#c4a44e]"
            >
              Shop Femme <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shop/homme"
              className="inline-flex items-center gap-2 rounded-full border border-[#d5cfc5] px-8 py-3.5 text-sm font-semibold text-[#1a1510] transition-all hover:border-[#c4a44e]"
            >
              Shop Homme <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
