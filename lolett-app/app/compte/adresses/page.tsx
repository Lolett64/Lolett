import type { Metadata } from 'next';
import { AddressList } from '@/components/compte/AddressList';

export const metadata: Metadata = { title: 'Mes adresses' };

export default function AdressesPage() {
  return <AddressList />;
}
