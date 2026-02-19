/* Version A — Sable & or : cohérente avec la nouvelle charte shop */
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HistoireVA() {
  return (
    <div className="relative min-h-screen bg-[#f3efe8] text-[#2a2520]">

      {/* Texture lin */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ── HERO — titre monumental sur fond sable ── */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-44 sm:pb-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-[#c4a44e]/[0.08]" />
        </div>
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

      {/* ── FONDATRICE — split image/texte ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Image */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#e8e2d8]">
              <Image
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=85"
                alt="La fondatrice LOLETT"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 45vw"
              />
            </div>

            {/* Texte */}
            <div className="max-w-xl">
              <div className="mb-6 h-px w-12 bg-[#c4a44e]" />
              <p className="text-[10px] font-medium tracking-wider uppercase text-[#b89840]">Les débuts</p>
              <h2 className="font-display mt-3 text-3xl font-bold text-[#1e1610] sm:text-4xl">
                Je sélectionne chaque pièce comme si c&apos;était pour moi.
              </h2>
              <div className="mt-8 space-y-5 text-base leading-relaxed text-[#4a3f35]">
                <p>
                  Des coupes qui tombent bien, des matières qu&apos;on a envie de toucher, et des prix qui ne font pas grimacer.
                </p>
                <p>
                  Ici, pas de tendances éphémères ni de collections à rallonge. Juste des pièces qui fonctionnent ensemble, pour que tu sortes de chez toi en te disant{' '}
                  <em className="font-semibold text-[#1e1610]">&laquo;&thinsp;ouais, je suis bien là&thinsp;&raquo;</em>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONCEPT PRÊT À SORTIR — fond légèrement plus foncé ── */}
      <section className="bg-[#ebe5d9] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Texte à gauche */}
            <div className="max-w-xl">
              <p className="text-[10px] font-medium tracking-wider uppercase text-[#b89840]">Le concept</p>
              <h2 className="font-display mt-3 text-3xl font-bold text-[#1e1610] sm:text-4xl">
                Prêt à sortir.
              </h2>
              <div className="mt-6 h-px w-12 bg-[#c4a44e]/50" />
              <div className="mt-6 space-y-4 text-base leading-relaxed text-[#4a3f35]">
                <p>
                  La plupart des sites te vendent des pièces. Nous, on te propose des{' '}
                  <span className="font-bold text-[#1e1610]">looks complets</span>.
                </p>
                <p>
                  Une chemise en lin qui va avec ce chino, cette ceinture et ces chaussures. Tu ajoutes tout d&apos;un clic, et tu es prêt.
                </p>
                <p className="italic text-[#7a6f63]">
                  C&apos;est comme avoir une amie styliste qui te dit &laquo;&thinsp;fais-moi confiance, prends ça&thinsp;&raquo;.
                </p>
              </div>
            </div>

            {/* Image droite */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#e8e2d8]">
              <Image
                src="https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=1000&q=85"
                alt="Style méditerranéen LOLETT"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 45vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── MATIÈRES — 3 colonnes ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="text-[10px] font-medium tracking-wider uppercase text-[#b89840]">Ce qu&apos;on choisit</p>
            <h2 className="font-display mt-3 text-3xl font-bold text-[#1e1610] sm:text-4xl">Nos matières</h2>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { num: '01', title: 'Lin français', text: 'Respirant, naturel, qui s\'adoucit à chaque lavage. Le tissu du Sud par excellence.' },
              { num: '02', title: 'Coton premium', text: 'Doux, résistant, 180g minimum. Pas de tissu qui se déforme au deuxième lavage.' },
              { num: '03', title: 'Viscose souple', text: 'Fluide, élégante, parfaite pour les robes et les chemises qui dansent au vent.' },
            ].map((m) => (
              <div key={m.num} className="rounded-2xl bg-white/50 p-8 backdrop-blur-sm">
                <span className="font-display text-5xl font-bold text-[#c4a44e]/25">{m.num}</span>
                <h3 className="mt-3 text-lg font-bold text-[#1e1610]">{m.title}</h3>
                <div className="mt-3 h-px w-8 bg-[#c4a44e]/40" />
                <p className="mt-4 text-sm leading-relaxed text-[#6a5f55]">{m.text}</p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-12 max-w-lg text-center text-sm italic leading-relaxed text-[#7a6f63]">
            On choisit des matières qui durent, qui s&apos;adoucissent à chaque lavage, et qui ne finissent pas au fond du placard. Parce que le vrai luxe, c&apos;est ce qu&apos;on porte vraiment.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#1e1610] py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="mx-auto mb-6 h-px w-12 bg-[#c4a44e]/40" />
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Installe-toi, regarde, et si tu craques…
          </h2>
          <p className="mx-auto mt-4 text-base italic text-white/40">On t&apos;avait prévenu.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/shop/femme" className="inline-flex items-center gap-2 rounded-full bg-[#c4a44e] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#b08e3a]">
              Shop Femme <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/shop/homme" className="inline-flex items-center gap-2 rounded-full border border-[#c4a44e]/40 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:border-[#c4a44e]">
              Shop Homme <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
