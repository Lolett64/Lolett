import type { Metadata } from 'next';
import { ContactV1 } from '@/components/contact/ContactV1';
import { getSiteContent } from '@/lib/cms/content';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Une question, une suggestion, un souci de commande ? L\'équipe LOLETT est là pour toi. Contacte-nous par formulaire ou par email.',
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },
  openGraph: {
    title: 'Contact — LOLETT',
    description: 'Une question, une suggestion ? On est là pour toi.',
    url: `${BASE_URL}/contact`,
    type: 'website',
  },
};

export default async function ContactPage() {
  const content = await getSiteContent('contact');
  return <ContactV1 content={content} />;
}
