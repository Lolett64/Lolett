import type { Metadata } from 'next';
import Link from 'next/link';
import { SAND, GOLD, BROWN } from '@/components/sections/notre-histoire/constants';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolettshop.com';

export const metadata: Metadata = {
  title: 'Merci — Carte cadeau LOLETT',
  description: 'Ta carte cadeau LOLETT a bien été envoyée.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${BASE_URL}/cartes-cadeaux/merci`,
  },
};

export default function GiftCardThanksPage() {
  return (
    <main
      style={{
        background: SAND,
        color: BROWN,
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(48px, 8vw, 96px) 24px',
      }}
    >
      <section
        style={{
          maxWidth: 640,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: `${GOLD}22`,
            color: GOLD,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-newsreader), serif',
            fontSize: 32,
            fontStyle: 'italic',
            marginBottom: 28,
          }}
          aria-hidden
        >
          ✓
        </div>
        <p
          style={{
            fontFamily: 'var(--font-montserrat), sans-serif',
            fontSize: 12,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: GOLD,
            marginBottom: 16,
          }}
        >
          Paiement confirmé
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-newsreader), serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            lineHeight: 1.15,
            fontWeight: 400,
            color: BROWN,
            marginBottom: 20,
          }}
        >
          Merci, c’est en chemin
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-montserrat), sans-serif',
            fontSize: 'clamp(15px, 1.6vw, 17px)',
            lineHeight: 1.8,
            color: 'rgba(26,21,16,0.75)',
            marginBottom: 12,
          }}
        >
          Ta carte cadeau a bien été envoyée à son destinataire par email, accompagnée de ton petit
          mot.
        </p>
        <p
          style={{
            fontFamily: 'var(--font-montserrat), sans-serif',
            fontSize: 14,
            lineHeight: 1.7,
            color: 'rgba(26,21,16,0.6)',
            marginBottom: 40,
          }}
        >
          Tu recevras également une confirmation d’achat sur ton adresse email. Si l’email tarde,
          pense à vérifier tes spams.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
          }}
        >
          <Link
            href="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: GOLD,
              color: '#fff',
              borderRadius: 40,
              padding: '14px 30px',
              fontFamily: 'var(--font-montserrat), sans-serif',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Retour à la boutique
          </Link>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              color: BROWN,
              border: `1px solid ${BROWN}`,
              borderRadius: 40,
              padding: '14px 30px',
              fontFamily: 'var(--font-montserrat), sans-serif',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Accueil
          </Link>
        </div>
      </section>
    </main>
  );
}
