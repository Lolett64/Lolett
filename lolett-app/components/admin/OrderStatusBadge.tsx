import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payé',
  confirmed: 'Confirmé',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
  refunded: 'Remboursé',
  expired: 'Expiré',
};

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  paid: 'bg-blue-100 text-blue-800 border-blue-200',
  confirmed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  refunded: 'bg-orange-100 text-orange-800 border-orange-200',
  expired: 'bg-gray-100 text-gray-600 border-gray-200',
};

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium', STATUS_CLASSES[status] ?? STATUS_CLASSES.expired)}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
