import type { Metadata } from 'next';
import {
  HeroHistoireV2,
  OrigineSection,
  VisionSection,
  MediterraneeSection,
  CTAHistoireV2,
} from '@/components/sections/histoire/v2';
import { getSiteContent } from '@/lib/cms/content';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Notre Histoire',
  description:
    'LOLETT est née d\'une évidence : on mérite tous d\'être bien habillés sans y passer trois heures. Découvrez notre histoire, pensée au Sud.',
  alternates: {
    canonical: `${BASE_URL}/notre-histoire`,
  },
  openGraph: {
    title: 'Notre Histoire — LOLETT',
    description:
      'Mode méditerranéenne pensée au Sud, portée partout. Découvrez l\'histoire de LOLETT.',
    url: `${BASE_URL}/notre-histoire`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/chemise-lin-mediterranee.png`,
        width: 800,
        height: 600,
        alt: 'LOLETT — Mode Méditerranéenne',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Notre Histoire — LOLETT',
    description:
      'Mode méditerranéenne pensée au Sud, portée partout.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Notre Histoire — LOLETT',
  description:
    'LOLETT est née d\'une évidence : on mérite tous d\'être bien habillés sans y passer trois heures.',
  url: `${BASE_URL}/notre-histoire`,
  publisher: {
    '@type': 'Organization',
    name: 'LOLETT',
    url: BASE_URL,
  },
};

export default async function NotreHistoirePage() {
  const content = await getSiteContent('notre_histoire');

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroHistoireV2 content={content} />
      <OrigineSection content={content} />
      <VisionSection content={content} />
      <MediterraneeSection content={content} />
      <CTAHistoireV2 content={content} />
    </div>
  );
}
