/* Version D — Immersif pleine largeur : grandes photos qui saignent, citations monumentales */
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HistoireVD() {
  return (
    <div className="min-h-screen bg-[#fefcf8]">

      {/* ── HERO — plein écran, texte en bas gauche ── */}
      <section className="relative h-screen overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=1800&q=85"
          alt="L'univers LOLETT"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Texte bas-gauche */}
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-16">
          <div className="mx-auto max-w-7xl">
            <p className="text-[10px] font-medium tracking-wider uppercase text-[#c4a44e]">Notre Histoire</p>
            <h1 className="font-display mt-4 max-w-2xl text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
              LOLETT, c&apos;est parti<br />d&apos;une idée simple.
            </h1>
            {/* Scroll indicator */}
            <div className="mt-10 flex items-center gap-4">
              <div className="h-12 w-px bg-white/20" />
              <p className="text-xs text-white/40">Défiler</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CITATION MONUMENTALE 1 ── */}
      <section className="py-24 sm:py-36">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-start gap-6">
            <div className="mt-4 h-px w-16 flex-shrink-0 bg-[#c4a44e]" />
            <blockquote className="font-display text-3xl font-bold leading-tight text-[#1a1510] sm:text-4xl lg:text-5xl">
              On mérite tous d&apos;être bien habillés sans y passer trois heures.
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── FONDATRICE — image plein fond ── */}
      <section className="relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image pleine hauteur */}
          <div className="relative min-h-[60vh] bg-[#e8e3d9] lg:min-h-[80vh]">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=85"
              alt="La fondatrice LOLETT"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Texte — fond sable */}
          <div className="flex flex-col justify-center bg-[#f3efe8] px-10 py-16 sm:px-16 lg:py-0">
            <p className="text-[10px] font-medium tracking-wider uppercase text-[#b89840]">Les débuts</p>
            <h2 className="font-display mt-5 text-3xl font-bold text-[#1a1510] sm:text-4xl">
              Je sélectionne chaque pièce comme si c&apos;était pour moi.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-[#4a3f35]">
              <p>Des coupes qui tombent bien, des matières qu&apos;on a envie de toucher, et des prix qui ne font pas grimacer.</p>
              <p>
                Juste des pièces qui fonctionnent ensemble, pour que tu sortes de chez toi en te disant{' '}
                <em className="font-bold text-[#1a1510]">&laquo;&thinsp;ouais, je suis bien là&thinsp;&raquo;</em>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CITATION 2 — sombre pleine largeur ── */}
      <section className="bg-[#1a1510] py-24 sm:py-36">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-[10px] font-medium tracking-wider uppercase text-[#c4a44e]/60">Le concept</p>
          <h2 className="font-display mt-8 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Prêt à sortir.
          </h2>
          <div className="mx-auto mt-8 h-px w-16 bg-[#c4a44e]/30" />
          <p className="mx-auto mt-8 max-w-[50ch] text-xl leading-relaxed text-white/55">
            La plupart des sites te vendent des pièces. Nous, on te propose des{' '}
            <span className="font-bold text-[#c4a44e]">looks complets</span>.
            Une chemise en lin qui va avec ce chino, cette ceinture et ces chaussures.
          </p>
          <p className="mt-6 text-sm italic text-white/30">
            C&apos;est comme avoir une amie styliste — sauf que tu peux le faire en pyjama.
          </p>
        </div>
      </section>

      {/* ── MATIÈRES — grille images + texte ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="text-[10px] font-medium tracking-wider uppercase text-[#b89840]">Ce qu&apos;on choisit</p>
            <h2 className="font-display mt-3 text-4xl font-bold text-[#1a1510] sm:text-5xl">Nos matières</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { num: '01', title: 'Lin français', text: 'Respirant, naturel, qui s\'adoucit à chaque lavage. Le tissu du Sud par excellence.', src: '/images/chemise-lin-mediterranee.png' },
              { num: '02', title: 'Coton premium', text: 'Doux, résistant, 180g minimum. Pas de tissu qui se déforme au deuxième lavage.', src: '/images/polo-pique-riviera.png' },
              { num: '03', title: 'Viscose souple', text: 'Fluide, élégante, parfaite pour les robes et les chemises qui dansent au vent.', src: '/images/robe-midi-provencale.png' },
            ].map((m) => (
              <div key={m.num} className="group overflow-hidden rounded-2xl bg-[#f3efe8]">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e3d9]">
                  <Image
                    src={m.src}
                    alt={m.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 90vw, 30vw"
                  />
                </div>
                {/* Texte */}
                <div className="p-6">
                  <span className="font-display text-3xl font-bold text-[#c4a44e]/25">{m.num}</span>
                  <h3 className="mt-2 text-lg font-bold text-[#1a1510]">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#7a6f63]">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — image plein fond avec overlay ── */}
      <section className="relative overflow-hidden py-32">
        <Image
          src="https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=1600&q=80"
          alt="CTA LOLETT"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#1a1510]/75" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">
            Installe-toi, regarde,<br />et si tu craques…
          </h2>
          <p className="mt-5 text-base italic text-white/40">On t&apos;avait prévenu.</p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/shop/femme" className="inline-flex items-center gap-2 rounded-full bg-[#c4a44e] px-9 py-4 text-sm font-bold text-white transition-all hover:bg-[#b08e3a]">
              Shop Femme <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/shop/homme" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-9 py-4 text-sm font-bold text-white transition-all hover:border-white/50">
              Shop Homme <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
