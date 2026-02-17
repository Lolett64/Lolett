import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Mon Panier — LOLETT',
  description:
    'Votre panier LOLETT. Vérifiez vos articles, ajustez les quantités et passez commande. Livraison offerte dès 100 €.',
  alternates: {
    canonical: `${BASE_URL}/panier`,
  },
  openGraph: {
    title: 'Mon Panier — LOLETT',
    description: 'T\'es à deux clics d\'être le plus stylé de ta terrasse.',
    url: `${BASE_URL}/panier`,
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function PanierLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
