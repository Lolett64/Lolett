import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Mes Favoris — LOLETT',
  description:
    'Retrouvez toutes les pièces LOLETT que vous avez ajoutées à vos favoris. Vos coups de coeur vous attendent.',
  alternates: {
    canonical: `${BASE_URL}/favoris`,
  },
  openGraph: {
    title: 'Mes Favoris — LOLETT',
    description: 'Vos coups de coeur LOLETT vous attendent.',
    url: `${BASE_URL}/favoris`,
    type: 'website',
  },
};

export default function FavorisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
