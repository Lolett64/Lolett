import type { Metadata } from 'next';
import { OrderList } from '@/components/compte/OrderList';

export const metadata: Metadata = { title: 'Mes commandes' };

export default function CommandesPage() {
  return <OrderList />;
}
