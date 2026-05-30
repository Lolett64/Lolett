import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

const { eqMock, setPickupPointMock } = vi.hoisted(() => ({
  eqMock: vi.fn(),
  setPickupPointMock: vi.fn(),
}));

// Le picker fait : .from('pickup_points').select(...).eq('country','FR').order('sort_order',...)
// On mocke la chaîne : select() -> { eq() } -> { order() résolu }.
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: eqMock,
        }),
      }),
    }),
  }),
}));

vi.mock('@/features/cart', () => ({
  useCartStore: (selector: (s: unknown) => unknown) =>
    selector({
      shippingCountry: 'FR',
      pickupPoint: null,
      setPickupPoint: setPickupPointMock,
    }),
}));

import { ClickCollectPicker } from '@/features/checkout/components/ClickCollectPicker';

const DB_POINTS = [
  {
    id: 'pt-1',
    name: 'Boutique du Marais',
    address: '12 rue des Archives',
    postal_code: '75004',
    city: 'Paris',
    country: 'FR',
    hours: 'Lun-Sam 10h-19h',
    instructions: 'Demandez Lola a la caisse',
  },
];

describe('ClickCollectPicker', () => {
  beforeEach(() => {
    eqMock.mockReset();
    setPickupPointMock.mockReset();
  });

  it('liste les points actifs renvoyes par Supabase', async () => {
    eqMock.mockResolvedValueOnce({ data: DB_POINTS, error: null });
    render(<ClickCollectPicker />);
    await waitFor(() => {
      expect(screen.getByText('Boutique du Marais')).toBeInTheDocument();
    });
    expect(screen.getByText(/12 rue des Archives/)).toBeInTheDocument();
    expect(screen.getByText(/Lun-Sam 10h-19h/)).toBeInTheDocument();
  });

  it('construit un ClickCollectPickupPoint et appelle setPickupPoint au clic', async () => {
    eqMock.mockResolvedValueOnce({ data: DB_POINTS, error: null });
    render(<ClickCollectPicker />);
    await waitFor(() => screen.getByText('Boutique du Marais'));
    fireEvent.click(screen.getByText('Boutique du Marais'));
    expect(setPickupPointMock).toHaveBeenCalledWith({
      provider: 'click_collect',
      id: 'pt-1',
      name: 'Boutique du Marais',
      address: '12 rue des Archives',
      postalCode: '75004',
      city: 'Paris',
      country: 'FR',
      hours: 'Lun-Sam 10h-19h',
      instructions: 'Demandez Lola a la caisse',
    });
  });

  it('affiche un etat vide quand aucun point actif', async () => {
    eqMock.mockResolvedValueOnce({ data: [], error: null });
    render(<ClickCollectPicker />);
    await waitFor(() => {
      expect(screen.getByText(/Aucun point de retrait/i)).toBeInTheDocument();
    });
  });

  it('affiche une erreur si le fetch echoue', async () => {
    eqMock.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });
    render(<ClickCollectPicker />);
    await waitFor(() => {
      expect(screen.getByText(/Impossible de charger/i)).toBeInTheDocument();
    });
  });
});
