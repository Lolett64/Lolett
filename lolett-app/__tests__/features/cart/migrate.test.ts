import { describe, it, expect } from 'vitest';
import { migrateCart } from '@/features/cart/store';

describe('migrateCart (v3)', () => {
  it('backfills provider="mondial_relay" on a legacy pickupPoint without provider', () => {
    const result = migrateCart(
      {
        shippingMethod: 'mondial_relay',
        pickupPoint: { id: '1', name: 'Relais', address: 'x', postalCode: '75001', city: 'Paris', country: 'FR' },
      },
      2
    );
    expect(result.pickupPoint).not.toBeNull();
    expect((result.pickupPoint as { provider?: string }).provider).toBe('mondial_relay');
  });

  it('does not overwrite an existing provider', () => {
    const result = migrateCart(
      {
        shippingMethod: 'click_collect',
        pickupPoint: { id: '1', name: 'Boutique', address: 'x', postalCode: '75001', city: 'Paris', country: 'FR', provider: 'click_collect' },
      },
      2
    );
    expect((result.pickupPoint as { provider?: string }).provider).toBe('click_collect');
  });

  it('does not mutate the input pickupPoint object', () => {
    const input = {
      shippingMethod: 'mondial_relay',
      pickupPoint: { id: '1', name: 'Relais', address: 'x', postalCode: '75001', city: 'Paris', country: 'FR' },
    };
    migrateCart(input, 2);
    expect('provider' in input.pickupPoint).toBe(false);
  });

  it('resets to home + null pickupPoint when shippingMethod is invalid', () => {
    const result = migrateCart(
      { shippingMethod: 'drone_delivery', pickupPoint: { id: '1' } },
      2
    );
    expect(result.shippingMethod).toBe('home');
    expect(result.pickupPoint).toBeNull();
  });

  it('keeps a valid click_collect method untouched', () => {
    const result = migrateCart(
      {
        shippingMethod: 'click_collect',
        pickupPoint: { id: '1', name: 'B', address: 'x', postalCode: '75001', city: 'Paris', country: 'FR', provider: 'click_collect' },
      },
      2
    );
    expect(result.shippingMethod).toBe('click_collect');
  });

  it('is a no-op on an empty persisted state', () => {
    const result = migrateCart({}, 2);
    expect(result).toBeDefined();
    // état vide → shippingMethod absent → reset à 'home'
    expect(result.shippingMethod).toBe('home');
  });
});
