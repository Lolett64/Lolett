import { describe, it, expect } from 'vitest';
import { mapPickupPoint } from '@/lib/adapters/supabase-mappers';

const RAW_LEGACY = {
  id: '12345',
  name: 'Tabac de la Gare',
  address: '1 rue de la Gare',
  postalCode: '75001',
  city: 'Paris',
  country: 'FR',
};

describe('mapPickupPoint', () => {
  it('returns null when raw is null', () => {
    expect(mapPickupPoint(null, 'mondial_relay')).toBeNull();
  });

  it('returns null when raw is not an object', () => {
    expect(mapPickupPoint('nope', 'mondial_relay')).toBeNull();
  });

  it('backfills provider="mondial_relay" on a legacy snapshot with MR shipping method', () => {
    const point = mapPickupPoint(RAW_LEGACY, 'mondial_relay');
    expect(point?.provider).toBe('mondial_relay');
    expect(point?.name).toBe('Tabac de la Gare');
  });

  it('backfills provider="mondial_relay" when no shipping method (legacy default)', () => {
    const point = mapPickupPoint(RAW_LEGACY, null);
    expect(point?.provider).toBe('mondial_relay');
  });

  it('backfills provider="click_collect" when shipping method is click_collect', () => {
    const point = mapPickupPoint(RAW_LEGACY, 'click_collect');
    expect(point?.provider).toBe('click_collect');
  });

  it('preserves an explicit provider on the snapshot over the inference', () => {
    const point = mapPickupPoint(
      { ...RAW_LEGACY, provider: 'click_collect' },
      'mondial_relay'
    );
    expect(point?.provider).toBe('click_collect');
  });
});
