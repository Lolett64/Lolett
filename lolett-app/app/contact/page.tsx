import type { Metadata } from 'next';
import { ContactV2 } from '@/components/contact/ContactV2';
import { getSiteContent } from '@/lib/cms/content';

export const revalidate = 60;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Une question, une suggestion, un souci de commande ? Écris-moi ! Je te réponds sous 24-48h.',
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },
  openGraph: {
    title: 'Contact — LOLETT',
    description: 'Une question, une suggestion ? Écris-moi !',
    url: `${BASE_URL}/contact`,
    type: 'website',
  },
};

export default async function ContactPage() {
  const content = await getSiteContent('contact');
  return <ContactV2 content={content} />;
}
