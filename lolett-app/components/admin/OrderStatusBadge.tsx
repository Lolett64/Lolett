import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';
import type { OrderStatus } from '@/types';

interface OrderStatusBadgeProps {
  status: string;
}

function isOrderStatus(value: string): value is OrderStatus {
  return value in ORDER_STATUS_LABELS;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const label = isOrderStatus(status) ? ORDER_STATUS_LABELS[status] : status;
  const twFull = isOrderStatus(status)
    ? ORDER_STATUS_COLORS[status].twFull
    : ORDER_STATUS_COLORS.expired.twFull;

  return (
    <Badge
      variant="outline"
      className={cn('text-[10px] font-medium rounded-md tracking-wide', twFull)}
    >
      {label}
    </Badge>
  );
}
