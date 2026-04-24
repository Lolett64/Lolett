import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GiftCardForm } from './Form';
import { SAND, GOLD, BROWN } from '@/components/sections/notre-histoire/constants';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

const VALID_AMOUNTS = [25, 50, 100, 150] as const;
type ValidAmount = (typeof VALID_AMOUNTS)[number];

function parseAmount(raw: string): ValidAmount | null {
  const n = Number(raw);
  return (VALID_AMOUNTS as readonly number[]).includes(n) ? (n as ValidAmount) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ amount: string }>;
}): Promise<Metadata> {
  const { amount: raw } = await params;
  const amount = parseAmount(raw);
  if (!amount) {
    return { title: 'Carte cadeau' };
  }
  return {
    title: `Carte cadeau ${amount} € — LOLETT`,
    description: `Offrez une carte cadeau LOLETT de ${amount} €. Envoi par email, valable 1 an sur toute la boutique.`,
    alternates: {
      canonical: `${BASE_URL}/cartes-cadeaux/${amount}`,
    },
    openGraph: {
      title: `Carte cadeau ${amount} € — LOLETT`,
      description: `Offrez une carte cadeau LOLETT de ${amount} €.`,
      url: `${BASE_URL}/cartes-cadeaux/${amount}`,
      type: 'website',
    },
  };
}

export default async function GiftCardAmountPage({
  params,
}: {
  params: Promise<{ amount: string }>;
}) {
  const { amount: raw } = await params;
  const amount = parseAmount(raw);
  if (!amount) notFound();

  return (
    <main style={{ background: SAND, color: BROWN, minHeight: '60vh' }}>
      <section
        style={{
          padding: 'clamp(32px, 5vw, 56px) 24px clamp(16px, 2vw, 24px)',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <nav
          style={{
            fontFamily: 'var(--font-montserrat), sans-serif',
            fontSize: 12,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(26,21,16,0.5)',
            marginBottom: 24,
          }}
        >
          <Link href="/cartes-cadeaux" style={{ color: 'inherit', textDecoration: 'none' }}>
            ← Retour aux cartes cadeaux
          </Link>
        </nav>
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
          Carte cadeau
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-newsreader), serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            lineHeight: 1.15,
            fontWeight: 400,
            color: BROWN,
            marginBottom: 8,
          }}
        >
          Une carte cadeau de {amount} €
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-montserrat), sans-serif',
            fontSize: 15,
            lineHeight: 1.7,
            color: 'rgba(26,21,16,0.7)',
            maxWidth: 640,
          }}
        >
          Renseigne les informations ci-dessous — le code sera envoyé par email au destinataire
          après confirmation du paiement.
        </p>
      </section>

      <GiftCardForm amount={amount} />
    </main>
  );
}
