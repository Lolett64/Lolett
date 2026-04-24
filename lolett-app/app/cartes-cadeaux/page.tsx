import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/sections/notre-histoire/Reveal';
import { SAND, GOLD, BROWN, WARM_CREAM } from '@/components/sections/notre-histoire/constants';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Cartes cadeaux LOLETT — Offrez le style',
  description:
    'Offrez une carte cadeau LOLETT à vos proches. Disponible en 25, 50, 100 ou 150 €, valable 1 an sur toute la boutique.',
  alternates: {
    canonical: `${BASE_URL}/cartes-cadeaux`,
  },
  openGraph: {
    title: 'Cartes cadeaux LOLETT — Offrez le style',
    description:
      'Offrez une carte cadeau LOLETT. Disponible en 25, 50, 100 ou 150 €, valable 1 an sur toute la boutique.',
    url: `${BASE_URL}/cartes-cadeaux`,
    type: 'website',
  },
};

const AMOUNTS: { value: 25 | 50 | 100 | 150; tagline: string }[] = [
  { value: 25, tagline: 'Une petite attention qui fait plaisir' },
  { value: 50, tagline: 'Idéal pour un cadeau raffiné' },
  { value: 100, tagline: 'Pour marquer une occasion spéciale' },
  { value: 150, tagline: 'Pour les grandes occasions' },
];

const STEPS = [
  {
    n: '01',
    title: 'Choisis un montant',
    text: 'Quatre valeurs disponibles pour s’adapter à toutes les envies.',
  },
  {
    n: '02',
    title: 'Renseigne le destinataire',
    text: 'Nom, email et un petit mot personnel si tu le souhaites.',
  },
  {
    n: '03',
    title: 'Il reçoit son code par email',
    text: 'À utiliser directement sur lolett.fr, au moment qu’il aura choisi.',
  },
];

export default function CartesCadeauxPage() {
  return (
    <main style={{ background: SAND, color: BROWN }}>
      {/* HERO */}
      <section
        style={{
          padding: 'clamp(48px, 8vw, 96px) 24px clamp(24px, 4vw, 48px)',
          maxWidth: 900,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <Reveal>
          <p
            style={{
              fontFamily: 'var(--font-montserrat), sans-serif',
              fontSize: 12,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: GOLD,
              marginBottom: 20,
            }}
          >
            Cartes cadeaux
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-newsreader), serif',
              fontSize: 'clamp(2.2rem, 6vw, 4rem)',
              lineHeight: 1.1,
              fontWeight: 400,
              color: BROWN,
              marginBottom: 24,
            }}
          >
            Offrez le style LOLETT
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p
            style={{
              fontFamily: 'var(--font-montserrat), sans-serif',
              fontSize: 'clamp(15px, 1.6vw, 17px)',
              lineHeight: 1.8,
              color: 'rgba(26,21,16,0.75)',
              maxWidth: 640,
              margin: '0 auto',
            }}
          >
            Un cadeau simple, élégant, et qui laisse le choix. La carte cadeau LOLETT se glisse dans
            toutes les occasions — anniversaire, fête, remerciement — et s’utilise sur toute la
            boutique.
          </p>
        </Reveal>
      </section>

      <div style={{ width: 60, height: 1, background: GOLD, margin: '0 auto 16px', opacity: 0.4 }} />

      {/* GRID MONTANTS */}
      <section
        style={{
          padding: 'clamp(24px, 4vw, 48px) 24px clamp(40px, 6vw, 80px)',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
          }}
        >
          {AMOUNTS.map((amount, i) => (
            <Reveal key={amount.value} delay={i * 0.08}>
              <Link
                href={`/cartes-cadeaux/${amount.value}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  background: WARM_CREAM,
                  border: `1px solid ${GOLD}33`,
                  borderRadius: 16,
                  padding: 'clamp(24px, 3vw, 36px) clamp(20px, 2.5vw, 28px)',
                  textDecoration: 'none',
                  color: BROWN,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                }}
                className="gift-card-tile"
              >
                <div
                  style={{
                    fontFamily: 'var(--font-newsreader), serif',
                    fontSize: 'clamp(2.6rem, 5vw, 3.6rem)',
                    color: GOLD,
                    lineHeight: 1,
                    fontWeight: 400,
                  }}
                >
                  {amount.value}&nbsp;€
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-montserrat), sans-serif',
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: 'rgba(26,21,16,0.7)',
                    margin: '20px 0 28px',
                    flexGrow: 1,
                  }}
                >
                  {amount.tagline}
                </p>
                <span
                  style={{
                    display: 'inline-flex',
                    alignSelf: 'flex-start',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: GOLD,
                    color: '#fff',
                    borderRadius: 40,
                    padding: '12px 26px',
                    fontFamily: 'var(--font-montserrat), sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Choisir
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
        <style>{`
          .gift-card-tile:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(26,21,16,0.08);
            border-color: ${GOLD}99 !important;
          }
        `}</style>
      </section>

      <div style={{ width: 60, height: 1, background: GOLD, margin: '0 auto', opacity: 0.4 }} />

      {/* COMMENT CA MARCHE */}
      <section
        style={{
          padding: 'clamp(48px, 7vw, 96px) 24px',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <Reveal>
          <h2
            style={{
              fontFamily: 'var(--font-newsreader), serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 400,
              textAlign: 'center',
              marginBottom: 56,
              color: BROWN,
            }}
          >
            Comment ça marche
          </h2>
        </Reveal>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 32,
          }}
        >
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.1}>
              <div style={{ textAlign: 'center', padding: '0 12px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-newsreader), serif',
                    fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
                    color: GOLD,
                    marginBottom: 12,
                    fontStyle: 'italic',
                  }}
                >
                  {step.n}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-newsreader), serif',
                    fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                    fontWeight: 500,
                    marginBottom: 12,
                    color: BROWN,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-montserrat), sans-serif',
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: 'rgba(26,21,16,0.7)',
                  }}
                >
                  {step.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* VALIDITE */}
      <section
        style={{
          padding: '0 24px clamp(64px, 8vw, 120px)',
          textAlign: 'center',
        }}
      >
        <Reveal>
          <p
            style={{
              fontFamily: 'var(--font-newsreader), serif',
              fontStyle: 'italic',
              fontSize: 'clamp(14px, 1.5vw, 16px)',
              color: 'rgba(26,21,16,0.6)',
            }}
          >
            Valable 1 an à compter de la date d’achat, sur toute la boutique lolett.fr.
          </p>
        </Reveal>
      </section>
    </main>
  );
}
