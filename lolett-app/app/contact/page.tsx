import type { Metadata } from 'next';
import { ContactV2 } from '@/components/contact/ContactV2';

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

export default function ContactPage() {
  return <ContactV2 />;
}
