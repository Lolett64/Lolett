import { describe, it, expect } from 'vitest';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_TRANSITIONS,
  STRIPE_MANAGED_STATUSES,
  REFUNDABLE_STATUSES,
} from '@/lib/constants';
import { ORDER_STATUS_VALUES } from '@/lib/types/domain';

describe('ORDER_STATUS_TRANSITIONS', () => {
  it('has an entry for every status', () => {
    for (const status of ORDER_STATUS_VALUES) {
      expect(ORDER_STATUS_TRANSITIONS).toHaveProperty(status);
      expect(Array.isArray(ORDER_STATUS_TRANSITIONS[status])).toBe(true);
    }
  });

  it('allows confirmed -> ready_for_pickup (C&C entry point)', () => {
    expect(ORDER_STATUS_TRANSITIONS.confirmed).toContain('ready_for_pickup');
  });

  it('makes picked_up only refundable', () => {
    expect(ORDER_STATUS_TRANSITIONS.picked_up).toEqual([
      'refunded',
      'partially_refunded',
    ]);
  });

  it('makes cancelled/refunded/expired terminal', () => {
    expect(ORDER_STATUS_TRANSITIONS.cancelled).toEqual([]);
    expect(ORDER_STATUS_TRANSITIONS.refunded).toEqual([]);
    expect(ORDER_STATUS_TRANSITIONS.expired).toEqual([]);
  });
});

describe('ORDER_STATUS_LABELS / COLORS', () => {
  it('has a feminine label for every status', () => {
    for (const status of ORDER_STATUS_VALUES) {
      expect(typeof ORDER_STATUS_LABELS[status]).toBe('string');
      expect(ORDER_STATUS_LABELS[status].length).toBeGreaterThan(0);
    }
    expect(ORDER_STATUS_LABELS.ready_for_pickup).toBe('Prête au retrait');
    expect(ORDER_STATUS_LABELS.picked_up).toBe('Retirée');
  });

  it('has a color triple for every status', () => {
    for (const status of ORDER_STATUS_VALUES) {
      const c = ORDER_STATUS_COLORS[status];
      expect(c.hex).toMatch(/^#[0-9a-f]{6}$/i);
      expect(typeof c.tw).toBe('string');
      expect(typeof c.twFull).toBe('string');
    }
  });
});

describe('STRIPE_MANAGED_STATUSES / REFUNDABLE_STATUSES', () => {
  it('marks Stripe-managed statuses', () => {
    expect(STRIPE_MANAGED_STATUSES).toEqual([
      'refunded', 'partially_refunded', 'disputed', 'payment_review',
    ]);
  });

  it('includes ready_for_pickup as refundable (C&C no-show)', () => {
    expect(REFUNDABLE_STATUSES).toContain('ready_for_pickup');
  });
});
