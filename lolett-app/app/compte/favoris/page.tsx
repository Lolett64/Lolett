import type { Metadata } from 'next';
import { FavoritesList } from '@/components/compte/FavoritesList';

export const metadata: Metadata = { title: 'Mes favoris' };

export default function FavorisPage() {
  return <FavoritesList />;
}
