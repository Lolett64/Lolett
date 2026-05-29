import { describe, it, expect } from 'vitest';
import {
  ORDER_STATUS_VALUES,
  SHIPPING_METHOD_VALUES,
  SHIPPING_CARRIER_VALUES,
  SHIPPING_COUNTRY_CODES,
} from '@/lib/types/domain';

describe('domain enums', () => {
  it('declares the 13 order statuses', () => {
    expect(ORDER_STATUS_VALUES).toEqual([
      'pending', 'paid', 'confirmed',
      'shipped', 'delivered',
      'ready_for_pickup', 'picked_up',
      'cancelled', 'refunded', 'partially_refunded', 'disputed',
      'expired', 'payment_review',
    ]);
    expect(ORDER_STATUS_VALUES).toHaveLength(13);
  });

  it('declares the 3 shipping methods including click_collect', () => {
    expect(SHIPPING_METHOD_VALUES).toEqual(['home', 'mondial_relay', 'click_collect']);
  });

  it('declares the 3 shipping carriers including click_collect', () => {
    expect(SHIPPING_CARRIER_VALUES).toEqual(['colissimo', 'mondial_relay', 'click_collect']);
  });

  it('declares the 6 shipping country codes', () => {
    expect(SHIPPING_COUNTRY_CODES).toEqual(['FR', 'BE', 'LU', 'NL', 'ES', 'PT']);
  });
});
