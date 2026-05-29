import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { ORDER_STATUS_LABELS } from '@/lib/constants';

describe('OrderStatusBadge', () => {
  it('affiche le label centralisé pour ready_for_pickup', () => {
    render(<OrderStatusBadge status="ready_for_pickup" />);
    expect(screen.getByText(ORDER_STATUS_LABELS.ready_for_pickup)).toBeInTheDocument();
  });

  it('affiche le label centralisé pour picked_up', () => {
    render(<OrderStatusBadge status="picked_up" />);
    expect(screen.getByText(ORDER_STATUS_LABELS.picked_up)).toBeInTheDocument();
  });

  it('retombe sur le statut brut si inconnu', () => {
    render(<OrderStatusBadge status="bidon" />);
    expect(screen.getByText('bidon')).toBeInTheDocument();
  });
});
