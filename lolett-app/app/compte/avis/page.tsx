import type { Metadata } from 'next';
import { ReviewList } from '@/components/compte/ReviewList';

export const metadata: Metadata = { title: 'Mes avis' };

export default function AvisPage() {
  return <ReviewList />;
}
