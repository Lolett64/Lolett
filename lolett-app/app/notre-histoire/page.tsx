import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Notre Histoire — LOLETT',
  description:
    'LOLETT est née d\'une évidence : on mérite tous d\'être bien habillés sans y passer trois heures. Découvrez notre histoire, pensée au Sud.',
};

export default function NotreHistoirePage() {
  return (
    <div>
      {/* Hero full-width */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=1800&q=85"
          alt="L'univers LOLETT"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(26,21,16,0.5), rgba(26,21,16,0.8))' }} />
        <div className="relative z-10 px-6 text-center">
          <ScrollReveal>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#c4a44e' }}>Notre Histoire</span>
            <h1 className="font-display mx-auto mt-5 max-w-3xl text-4xl leading-tight font-bold text-white sm:text-5xl lg:text-6xl">
              LOLETT, c&apos;est parti d&apos;une idée simple.
            </h1>
          </ScrollReveal>
        </div>
      </section>

      {/* La fondatrice — ton perso, humain */}
      <section className="py-20 sm:py-32" style={{ background: '#fefcf8' }}>
        <div className="container">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <ScrollReveal>
              <div className="max-w-lg">
                <div className="mb-8 h-px w-16" style={{ background: '#c4a44e' }} />
                <p className="text-lg leading-relaxed sm:text-xl" style={{ color: '#3a2e1e' }}>
                  On mérite tous d&apos;être bien habillés sans y passer trois heures.
                </p>
                <p className="mt-6 text-lg leading-relaxed sm:text-xl" style={{ color: '#3a2e1e' }}>
                  Je sélectionne chaque pièce comme si c&apos;était pour moi <span className="italic" style={{ color: '#8a7d6b' }}>(spoiler : parfois c&apos;est le cas)</span>. Des coupes qui tombent bien, des matières qu&apos;on a envie de toucher, et des prix qui ne font pas grimacer.
                </p>
                <p className="mt-6 text-lg leading-relaxed sm:text-xl" style={{ color: '#3a2e1e' }}>
                  Ici, pas de tendances éphémères ni de collections à rallonge. Juste des pièces qui fonctionnent ensemble, pour que tu sortes de chez toi en te disant{' '}
                  <em className="font-medium" style={{ color: '#1a1510' }}>&laquo;&thinsp;ouais, je suis bien là&thinsp;&raquo;</em>.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=85"
                  alt="La fondatrice LOLETT"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Le concept — Prêt à sortir */}
      <section className="py-20 sm:py-28" style={{ background: '#1a1510' }}>
        <div className="container">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#c4a44e' }}>Le concept</span>
              <h2 className="font-display mt-5 text-3xl font-bold sm:text-4xl lg:text-5xl" style={{ color: '#fefcf8' }}>Prêt à sortir</h2>
              <p className="mt-6 text-lg leading-relaxed sm:text-xl" style={{ color: 'rgba(254,252,248,0.7)' }}>
                La plupart des sites te vendent des pièces. Nous, on te propose des{' '}
                <span className="font-semibold" style={{ color: '#c4a44e' }}>looks complets</span>.
                Une chemise en lin qui va avec ce chino, cette ceinture et ces chaussures.
                Tu ajoutes tout d&apos;un clic, et tu es prêt.
              </p>
              <p className="mt-4 text-base italic" style={{ color: 'rgba(254,252,248,0.5)' }}>
                C&apos;est comme avoir une amie styliste qui te dit &laquo;&thinsp;fais-moi confiance, prends ça&thinsp;&raquo;.
                Sauf que c&apos;est un site, et tu peux le faire en pyjama.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Nos matières */}
      <section className="py-20 sm:py-32" style={{ background: '#fefcf8' }}>
        <div className="container">
          <ScrollReveal>
            <div className="mb-14 text-center sm:mb-20">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#c4a44e' }}>Ce qu&apos;on choisit</span>
              <h2 className="font-display mt-4 text-3xl font-bold sm:text-4xl" style={{ color: '#1a1510' }}>Nos matières</h2>
            </div>
          </ScrollReveal>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-16">
            {[
              { num: '01', title: 'Lin français', text: 'Respirant, naturel, qui s\u2019adoucit à chaque lavage. Le tissu du Sud par excellence.' },
              { num: '02', title: 'Coton premium', text: 'Doux, résistant, 180g minimum. Pas de tissu qui se déforme au deuxième lavage.' },
              { num: '03', title: 'Viscose souple', text: 'Fluide, élégante, parfaite pour les robes et les chemises qui dansent au vent.' },
            ].map((m) => (
              <ScrollReveal key={m.num}>
                <div>
                  <span className="font-display text-4xl font-bold sm:text-5xl" style={{ color: 'rgba(196,164,78,0.3)' }}>{m.num}</span>
                  <h3 className="mt-3 text-lg font-semibold" style={{ color: '#1a1510' }}>{m.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: '#8a7d6b' }}>{m.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <p className="mx-auto mt-14 max-w-lg text-center text-base italic" style={{ color: '#8a7d6b' }}>
              On choisit des matières qui durent, qui s&apos;adoucissent à chaque lavage, et qui ne finissent pas au fond du placard. Parce que le vrai luxe, c&apos;est ce qu&apos;on porte vraiment.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA — vers les looks */}
      <section className="py-16 sm:py-24" style={{ background: 'rgba(196,164,78,0.08)' }}>
        <ScrollReveal>
          <div className="container text-center">
            <h2 className="font-display text-2xl font-bold sm:text-3xl" style={{ color: '#1a1510' }}>
              Installe-toi, regarde, et si tu craques&hellip;
            </h2>
            <p className="mx-auto mt-3 text-base italic" style={{ color: '#8a7d6b' }}>
              On t&apos;avait prévenu.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/shop/femme"
                className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: '#c4a44e' }}
              >
                Shop Femme <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/shop/homme"
                className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition-colors"
                style={{ border: '1px solid #c4a44e', color: '#c4a44e' }}
              >
                Shop Homme <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
