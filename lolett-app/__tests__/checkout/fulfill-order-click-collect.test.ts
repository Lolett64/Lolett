import { describe, it, expect, vi, beforeEach } from 'vitest';

const { fromMock, rpcMock, createMock, sendConfMock, decrementMock, captureMessageMock, afterMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  rpcMock: vi.fn(() => Promise.resolve({ data: null, error: null })),
  createMock: vi.fn(),
  sendConfMock: vi.fn().mockResolvedValue({ success: true }),
  decrementMock: vi.fn().mockResolvedValue(undefined),
  captureMessageMock: vi.fn(),
  afterMock: vi.fn((fn: () => unknown) => { void fn(); }),
}));

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return { ...actual, after: afterMock };
});
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: fromMock, rpc: rpcMock }) }));
vi.mock('@/lib/adapters/supabase', () => ({ SupabaseOrderRepository: class { create = createMock; } }));
vi.mock('@/lib/email/order-confirmation', () => ({ sendOrderConfirmation: sendConfMock }));
vi.mock('@/lib/orders/decrement-stock', () => ({ decrementStockForOrder: decrementMock }));
vi.mock('@sentry/nextjs', () => ({ captureMessage: captureMessageMock, captureException: vi.fn() }));

import { fulfillOrder } from '@/lib/checkout/fulfill-order';

const CUSTOMER = {
  firstName: 'Marie', lastName: 'Durand', email: 'm@ex.fr', phone: '+33612345678',
  address: '1 rue de Paris', city: 'Paris', postalCode: '75001', country: 'France',
};
const ITEMS = [{ productId: 'p1', productName: 'Robe', size: 'M' as const, quantity: 1, price: 49.9 }];
const CC_POINT = {
  provider: 'click_collect' as const, id: 'pt-1', name: 'Boutique du Marais',
  address: '12 rue de Bretagne', postalCode: '75003', city: 'Paris', country: 'FR',
};

const updates: Record<string, unknown>[] = [];
function setupAdmin(pickupRow: { id: string; is_active: boolean } | null) {
  updates.length = 0;
  fromMock.mockImplementation((table: string) => {
    if (table === 'orders') {
      return {
        select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }),
        update: (payload: Record<string, unknown>) => {
          updates.push(payload);
          return { eq: () => Promise.resolve({ error: null }) };
        },
      };
    }
    if (table === 'pickup_points') {
      return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: pickupRow, error: null }) }) }) };
    }
    if (table === 'cart_items') {
      return { delete: () => ({ eq: () => Promise.resolve({ error: null }) }) };
    }
    return {};
  });
}

const BASE = {
  items: ITEMS, customer: CUSTOMER, total: 49.9, shipping: 0,
  paymentProvider: 'stripe' as const,
  shippingMethod: 'click_collect' as const, shippingCarrier: 'click_collect' as const,
  shippingCountry: 'FR' as const, pickupPoint: CC_POINT,
  pickupPointId: 'pt-1', pickupProvider: 'click_collect',
};

describe('fulfillOrder — Click & Collect (chemin inline /session)', () => {
  beforeEach(() => {
    createMock.mockReset().mockResolvedValue({ id: 'ord-1', orderNumber: 'LOL-1' });
    sendConfMock.mockClear();
    decrementMock.mockClear();
    captureMessageMock.mockClear();
    afterMock.mockClear();
  });

  it('C&C avec point actif → crée avec pickup_point, marque paid, envoie l\'email provider-aware', async () => {
    setupAdmin({ id: 'pt-1', is_active: true });
    const id = await fulfillOrder({ ...BASE, paymentId: 'pi_1' });

    expect(id).toBe('ord-1');
    const createArg = createMock.mock.calls[0][0];
    expect(createArg.shippingMethod).toBe('click_collect');
    expect(createArg.pickupPoint).toEqual(CC_POINT);
    expect(updates.some((u) => u.status === 'paid')).toBe(true);
    expect(updates.some((u) => u.status === 'payment_review')).toBe(false);
    expect(decrementMock).toHaveBeenCalledTimes(1);
    expect(sendConfMock).toHaveBeenCalledTimes(1);
    const mailArg = sendConfMock.mock.calls[0][0];
    expect(mailArg.shippingMethod).toBe('click_collect');
    expect(mailArg.pickupPoint).toEqual(CC_POINT);
  });

  it('C&C point désactivé entre paiement et fulfillment → payment_review, pas d\'email ni de décrément', async () => {
    setupAdmin({ id: 'pt-1', is_active: false });
    await fulfillOrder({ ...BASE, paymentId: 'pi_2' });

    expect(updates.some((u) => u.status === 'payment_review')).toBe(true);
    expect(updates.some((u) => u.status === 'paid')).toBe(false);
    expect(captureMessageMock).toHaveBeenCalledTimes(1);
    expect(sendConfMock).not.toHaveBeenCalled();
    expect(decrementMock).not.toHaveBeenCalled();
  });

  it('C&C point introuvable (null) → payment_review', async () => {
    setupAdmin(null);
    await fulfillOrder({ ...BASE, paymentId: 'pi_3', pickupPointId: 'pt-x' });

    expect(updates.some((u) => u.status === 'payment_review')).toBe(true);
    expect(sendConfMock).not.toHaveBeenCalled();
  });

  it('home : transmet shippingMethod=home, marque paid, envoie l\'email (pas de garde C&C)', async () => {
    setupAdmin(null);
    await fulfillOrder({
      items: ITEMS, customer: CUSTOMER, total: 49.9, shipping: 5.9,
      paymentProvider: 'stripe', paymentId: 'pi_4',
      shippingMethod: 'home', shippingCarrier: 'colissimo', shippingCountry: 'FR', pickupPoint: null,
    });
    expect(updates.some((u) => u.status === 'paid')).toBe(true);
    expect(sendConfMock).toHaveBeenCalledTimes(1);
    expect(decrementMock).toHaveBeenCalledTimes(1);
  });
});
