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
  pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
  paid: 'bg-sky-50 text-sky-700 border-sky-200/60',
  confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  shipped: 'bg-violet-50 text-violet-700 border-violet-200/60',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200/60',
  refunded: 'bg-orange-50 text-orange-700 border-orange-200/60',
  expired: 'bg-stone-50 text-stone-500 border-stone-200/60',
};

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('text-[10px] font-medium rounded-md tracking-wide', STATUS_CLASSES[status] ?? STATUS_CLASSES.expired)}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
