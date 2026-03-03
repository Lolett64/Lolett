import type { Metadata } from 'next';
import NotreHistoireContent from './content';
import { getSiteContent } from '@/lib/cms/content';
import { getVisibleSectionKeys } from '@/lib/cms/sections';

export const revalidate = 60;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Mon Histoire',
  description:
    'Moi c\'est Lola. Découvrez l\'histoire derrière LOLETT, une marque construite avec le cœur depuis le Sud-Ouest.',
  alternates: {
    canonical: `${BASE_URL}/notre-histoire`,
  },
  openGraph: {
    title: 'Mon Histoire — LOLETT',
    description:
      'Moi c\'est Lola. Découvrez l\'histoire derrière LOLETT, une marque construite avec le cœur.',
    url: `${BASE_URL}/notre-histoire`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/chemise-lin-mediterranee.png`,
        width: 800,
        height: 600,
        alt: 'LOLETT — Mode du Sud-Ouest',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mon Histoire — LOLETT',
    description:
      'Mode du Sud-Ouest pensée au Sud, portée partout.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Mon Histoire — LOLETT',
  description:
    'Moi c\'est Lola. Découvrez l\'histoire derrière LOLETT, une marque construite avec le cœur.',
  url: `${BASE_URL}/notre-histoire`,
  publisher: {
    '@type': 'Organization',
    name: 'LOLETT',
    url: BASE_URL,
  },
};

export default async function NotreHistoirePage() {
  const [content, visibleSections] = await Promise.all([
    getSiteContent('notre_histoire'),
    getVisibleSectionKeys('notre-histoire'),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NotreHistoireContent content={content} visibleSections={visibleSections} />
    </>
  );
}
