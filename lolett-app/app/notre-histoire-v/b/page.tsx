/* Version B — Sombre cinématique : premium, dramatique */
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HistoireVB() {
  return (
    <div className="min-h-screen bg-[#0f0d0b] text-white">

      {/* ── HERO PLEIN ÉCRAN ── */}
      <section className="relative flex min-h-screen items-end overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=1800&q=85"
          alt="L'univers LOLETT"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d0b] via-[#0f0d0b]/50 to-transparent" />

        {/* Glow or */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,rgba(196,164,78,0.06),transparent_60%)]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 sm:pb-28">
          <p className="text-[10px] font-medium tracking-wider uppercase text-[#c4a44e]/70">Notre Histoire</p>
          <h1 className="font-display mt-5 max-w-3xl text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
            LOLETT, c&apos;est parti d&apos;une idée simple.
          </h1>
          <div className="mt-6 h-px w-20 bg-gradient-to-r from-[#c4a44e] to-transparent" />
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-white/60">
            On mérite tous d&apos;être bien habillés sans y passer trois heures.
          </p>
          {/* Scroll indicator */}
          <div className="mt-12 flex items-center gap-3 text-xs text-white/30">
            <div className="h-px w-8 bg-white/20" />
            Défiler pour découvrir
          </div>
        </div>
      </section>

      {/* ── FONDATRICE — sombre, image à droite ── */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_420px]">
            <div>
              <p className="text-[10px] font-medium tracking-wider uppercase text-[#c4a44e]/60">Les débuts</p>
              <h2 className="font-display mt-5 text-4xl font-bold leading-tight sm:text-5xl">
                Je sélectionne chaque pièce<br />comme si c&apos;était pour moi.
              </h2>
              <div className="mt-8 space-y-5 text-lg leading-relaxed text-white/55">
                <p>Des coupes qui tombent bien, des matières qu&apos;on a envie de toucher, et des prix qui ne font pas grimacer.</p>
                <p>
                  Pas de tendances éphémères. Juste des pièces qui fonctionnent ensemble, pour que tu sortes de chez toi en te disant{' '}
                  <em className="font-semibold text-white">&laquo;&thinsp;ouais, je suis bien là&thinsp;&raquo;</em>.
                </p>
              </div>
              <div className="mt-10 flex items-center gap-4">
                <div className="h-px w-16 bg-[#c4a44e]/30" />
                <p className="text-xs font-medium tracking-wider uppercase text-[#c4a44e]/50">Fondatrice LOLETT</p>
              </div>
            </div>

            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=85"
                alt="La fondatrice LOLETT"
                fill
                className="object-cover opacity-80"
                sizes="(max-width: 1024px) 90vw, 420px"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CONCEPT — pleine largeur sombre, texte centré dramatique ── */}
      <section className="relative overflow-hidden border-y border-[#1e1c18] py-24 sm:py-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,164,78,0.05),transparent_65%)]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="text-[10px] font-medium tracking-wider uppercase text-[#c4a44e]/60">Le concept</p>
          <h2 className="font-display mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Prêt à sortir.
          </h2>
          <div className="mx-auto mt-8 h-px w-16 bg-gradient-to-r from-transparent via-[#c4a44e]/50 to-transparent" />
          <p className="mx-auto mt-8 max-w-[50ch] text-xl leading-relaxed text-white/55">
            La plupart des sites te vendent des pièces. Nous, on te propose des{' '}
            <span className="font-bold text-[#c4a44e]">looks complets</span>.
            Une chemise en lin qui va avec ce chino, cette ceinture et ces chaussures.
          </p>
          <p className="mt-6 text-base italic text-white/30">
            C&apos;est comme avoir une amie styliste — sauf que tu peux le faire en pyjama.
          </p>
        </div>
      </section>

      {/* ── MATIÈRES — grille sombre ── */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium tracking-wider uppercase text-[#c4a44e]/60">Ce qu&apos;on choisit</p>
              <h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">Nos matières</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-px sm:grid-cols-3">
            {[
              { num: '01', title: 'Lin français', text: 'Respirant, naturel, qui s\'adoucit à chaque lavage. Le tissu du Sud par excellence.' },
              { num: '02', title: 'Coton premium', text: 'Doux, résistant, 180g minimum. Pas de tissu qui se déforme au deuxième lavage.' },
              { num: '03', title: 'Viscose souple', text: 'Fluide, élégante, parfaite pour les robes et les chemises qui dansent au vent.' },
            ].map((m, i) => (
              <div key={m.num} className="group relative bg-[#141210] p-10 transition-colors hover:bg-[#1a1814]">
                <span className="font-display text-7xl font-bold text-[#c4a44e]/10 transition-colors group-hover:text-[#c4a44e]/15">{m.num}</span>
                <h3 className="mt-4 text-lg font-bold text-white">{m.title}</h3>
                <div className="mt-3 h-px w-8 bg-[#c4a44e]/30" />
                <p className="mt-4 text-sm leading-relaxed text-white/40">{m.text}</p>
                {i < 2 && <div className="absolute top-0 right-0 h-full w-px bg-[#1e1c18]" />}
              </div>
            ))}
          </div>

          <p className="mt-14 text-center text-sm italic text-white/30">
            On choisit des matières qui durent, qui s&apos;adoucissent à chaque lavage, et qui ne finissent pas au fond du placard.
          </p>
        </div>
      </section>

      {/* ── CTA — doré sur sombre ── */}
      <section className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(196,164,78,0.08),transparent_65%)]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-4xl font-bold sm:text-5xl">
            Installe-toi, regarde,<br />et si tu craques…
          </h2>
          <p className="mt-4 text-base italic text-white/30">On t&apos;avait prévenu.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/shop/femme" className="inline-flex items-center gap-2 rounded-full bg-[#c4a44e] px-8 py-4 text-sm font-bold text-white transition-all hover:bg-[#b08e3a]">
              Shop Femme <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/shop/homme" className="inline-flex items-center gap-2 rounded-full border border-[#333] px-8 py-4 text-sm font-bold text-white transition-all hover:border-[#c4a44e]/40">
              Shop Homme <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
