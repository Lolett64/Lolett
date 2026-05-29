import { describe, it, expect } from 'vitest';
import { VARIABLES_BY_TEMPLATE } from '@/components/admin/emails/types';

describe('VARIABLES_BY_TEMPLATE', () => {
  it('déclare les variables du template order_ready_for_pickup', () => {
    expect(VARIABLES_BY_TEMPLATE.order_ready_for_pickup).toEqual([
      '{firstName}',
      '{orderNumber}',
      '{pickupCode}',
      '{pickupPointName}',
    ]);
  });
});
