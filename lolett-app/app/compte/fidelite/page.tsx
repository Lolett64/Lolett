import type { Metadata } from 'next';
import { LoyaltyPage } from '@/components/compte/LoyaltyPage';

export const metadata: Metadata = { title: 'Programme fidelite' };

export default function FidelitePage() {
  return <LoyaltyPage />;
}
