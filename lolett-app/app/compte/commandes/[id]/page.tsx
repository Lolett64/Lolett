import type { Metadata } from 'next';
import { OrderDetail } from '@/components/compte/OrderDetail';

export const metadata: Metadata = { title: 'Detail commande' };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetail orderId={id} />;
}
