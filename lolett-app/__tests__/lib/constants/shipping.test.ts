import { describe, it, expect } from 'vitest';
import {
  computeShippingCost,
  getTrackingUrl,
  SHIPPING_RATES,
  SHIPPING_METHODS,
  VALID_SHIPPING_METHODS,
} from '@/lib/constants';

describe('computeShippingCost', () => {
  it('returns 0 for click_collect in FR', () => {
    expect(computeShippingCost(20, 'FR', 'click_collect')).toBe(0);
  });

  it('throws for click_collect outside FR', () => {
    expect(() => computeShippingCost(20, 'BE', 'click_collect')).toThrow(
      /France/
    );
  });

  it('returns the FR home rate below the free-shipping threshold', () => {
    // seuil FR = 100, tarif home FR = 5.90
    expect(computeShippingCost(50, 'FR', 'home')).toBe(5.90);
  });

  it('returns 0 for FR home at or above the free-shipping threshold', () => {
    expect(computeShippingCost(100, 'FR', 'home')).toBe(0);
  });

  it('keeps the real existing rates (mondial_relay FR = 4.90, not 4.50)', () => {
    expect(SHIPPING_RATES.FR.mondial_relay).toBe(4.90);
    expect(SHIPPING_RATES.FR.click_collect).toBe(0);
    expect(SHIPPING_RATES.BENELUX.home).toBe(12.90);
    expect(SHIPPING_RATES.IBERIA.home).toBe(12.90);
    expect(SHIPPING_RATES.BENELUX.click_collect).toBeUndefined();
    expect(SHIPPING_RATES.IBERIA.click_collect).toBeUndefined();
  });
});

describe('getTrackingUrl', () => {
  it('returns null for click_collect', () => {
    expect(getTrackingUrl('click_collect', 'ANY')).toBeNull();
  });

  it('returns a La Poste URL for colissimo', () => {
    expect(getTrackingUrl('colissimo', 'XYZ123')).toContain('laposte.fr');
    expect(getTrackingUrl('colissimo', 'XYZ123')).toContain('XYZ123');
  });
});

describe('VALID_SHIPPING_METHODS', () => {
  it('is derived from SHIPPING_METHODS keys and includes click_collect', () => {
    expect(VALID_SHIPPING_METHODS).toEqual(Object.keys(SHIPPING_METHODS));
    expect(VALID_SHIPPING_METHODS).toContain('click_collect');
  });
});
