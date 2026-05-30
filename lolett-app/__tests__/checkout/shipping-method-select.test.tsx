import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const { setMethodMock, storeState } = vi.hoisted(() => ({
  setMethodMock: vi.fn(),
  storeState: {
    value: {
      shippingCountry: 'FR' as string,
      shippingMethod: 'home' as string,
      setShippingMethod: () => {},
    },
  },
}));

vi.mock('@/features/cart', () => ({
  useCartStore: (selector: (s: unknown) => unknown) => selector(storeState.value),
}));

// constants : on ne mocke pas, on utilise les vraies valeurs PR2 (SHIPPING_METHODS,
// SHIPPING_DELAYS, computeShippingCost, getShippingZone).
import { ShippingMethodSelect } from '@/features/checkout/components/ShippingMethodSelect';

describe('ShippingMethodSelect — gating FR + reset auto', () => {
  beforeEach(() => {
    setMethodMock.mockReset();
    storeState.value = {
      shippingCountry: 'FR',
      shippingMethod: 'home',
      setShippingMethod: setMethodMock,
    };
  });

  it('affiche les 3 options en France (dont Click & Collect)', () => {
    render(<ShippingMethodSelect subtotal={49.9} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(screen.getByText(/Click & Collect/i)).toBeInTheDocument();
  });

  it('masque Click & Collect hors France (BE)', () => {
    storeState.value = {
      shippingCountry: 'BE',
      shippingMethod: 'home',
      setShippingMethod: setMethodMock,
    };
    render(<ShippingMethodSelect subtotal={49.9} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(screen.queryByText(/Click & Collect/i)).not.toBeInTheDocument();
  });

  it('reset auto vers home si click_collect sélectionné mais pays hors FR', () => {
    storeState.value = {
      shippingCountry: 'BE',
      shippingMethod: 'click_collect',
      setShippingMethod: setMethodMock,
    };
    render(<ShippingMethodSelect subtotal={49.9} />);
    expect(setMethodMock).toHaveBeenCalledWith('home');
  });

  it('ne reset pas quand la méthode courante reste disponible', () => {
    storeState.value = {
      shippingCountry: 'FR',
      shippingMethod: 'click_collect',
      setShippingMethod: setMethodMock,
    };
    render(<ShippingMethodSelect subtotal={49.9} />);
    expect(setMethodMock).not.toHaveBeenCalled();
  });
});
