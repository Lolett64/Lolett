import { describe, it, expect } from 'vitest';
import { computePickupValidity } from '@/features/checkout/hooks/useCheckout';
import type { PickupPoint } from '@/types';

const CC_POINT: PickupPoint = {
  provider: 'click_collect',
  id: 'pt-1',
  name: 'Boutique du Marais',
  address: '12 rue des Archives',
  postalCode: '75004',
  city: 'Paris',
  country: 'FR',
  hours: null,
  instructions: null,
};

describe('computePickupValidity', () => {
  it('exige un point pour mondial_relay', () => {
    expect(computePickupValidity('mondial_relay', null)).toEqual({
      requiresPickupPoint: true,
      missing: true,
    });
  });

  it('exige un point pour click_collect', () => {
    expect(computePickupValidity('click_collect', null)).toEqual({
      requiresPickupPoint: true,
      missing: true,
    });
  });

  it("n'exige pas de point pour home", () => {
    expect(computePickupValidity('home', null)).toEqual({
      requiresPickupPoint: false,
      missing: false,
    });
  });

  it('valide quand le point est present pour click_collect', () => {
    expect(computePickupValidity('click_collect', CC_POINT)).toEqual({
      requiresPickupPoint: true,
      missing: false,
    });
  });
});
