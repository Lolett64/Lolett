import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  productsRows,
  pickupPointRow,
  sessionCreateMock,
  customersListMock,
  customersCreateMock,
} = vi.hoisted(() => ({
  productsRows: [{ id: 'prod-1', name: 'Robe Lola', price: 49.9 }],
  pickupPointRow: {
    value: null as null | Record<string, unknown>,
  },
  sessionCreateMock: vi.fn().mockResolvedValue({ url: 'https://stripe.test/session' }),
  customersListMock: vi.fn().mockResolvedValue({ data: [] }),
  customersCreateMock: vi.fn().mockResolvedValue({ id: 'cus_1' }),
}));

// Client admin mocké : router les tables products / pickup_points.
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'products') {
        return {
          select: () => ({
            in: () => Promise.resolve({ data: productsRows, error: null }),
          }),
        };
      }
      if (table === 'pickup_points') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                // .maybeSingle() (route alignée D3) : 0 ligne → { data: null, error: null }.
                maybeSingle: () => Promise.resolve({ data: pickupPointRow.value, error: null }),
              }),
            }),
          }),
        };
      }
      // promo_codes / gift_cards : non utilisés ici → maybeSingle null
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }),
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      };
    },
  }),
}));

vi.mock('stripe', () => ({
  // Stripe est instancié via `new Stripe(...)` → le default doit être un
  // constructeur. vitest 4 exige une vraie classe/fonction (pas une arrow).
  default: class {
    checkout = { sessions: { create: sessionCreateMock } };
    customers = { list: customersListMock, create: customersCreateMock, update: vi.fn() };
    coupons = { create: vi.fn() };
  },
}));

// Pas de redemption / facture / email dans ces scénarios C&C (pas de promo, pas de gift card).
vi.mock('@/lib/email/order-confirmation', () => ({ sendOrderConfirmation: vi.fn() }));
vi.mock('@/lib/email/order-new-admin', () => ({ sendNewOrderAlertToAdmin: vi.fn() }));
vi.mock('@/lib/invoice/generate-invoice', () => ({ generateInvoicePdf: vi.fn() }));

import { POST } from '@/app/api/checkout/stripe/route';

const BASE_BODY = {
  items: [{ productId: 'prod-1', productName: 'Robe Lola', size: 'M', quantity: 1 }],
  customer: {
    firstName: 'Marie', lastName: 'Durand', email: 'marie@ex.fr', phone: '+33612345678',
    address: '1 rue de Paris', city: 'Paris', postalCode: '75001', country: 'France',
  },
  total: 49.9,
  shipping: 0,
  userId: undefined,
};

function makeReq(body: unknown) {
  return new Request('http://x/api/checkout/stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest;
}

describe('POST /api/checkout/stripe — Click & Collect', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    sessionCreateMock.mockClear();
    pickupPointRow.value = null;
  });

  it('rejette click_collect hors France (400)', async () => {
    const res = await POST(makeReq({
      ...BASE_BODY,
      shippingMethod: 'click_collect',
      shippingCountry: 'BE',
      pickupPoint: { provider: 'click_collect', id: 'pt-1' },
    }));
    expect(res.status).toBe(400);
    expect(sessionCreateMock).not.toHaveBeenCalled();
  });

  it('rejette un pickupPoint inconnu / inactif (400)', async () => {
    pickupPointRow.value = null; // .maybeSingle() renvoie data: null
    const res = await POST(makeReq({
      ...BASE_BODY,
      shippingMethod: 'click_collect',
      shippingCountry: 'FR',
      pickupPoint: { provider: 'click_collect', id: 'pt-unknown' },
    }));
    expect(res.status).toBe(400);
    expect(sessionCreateMock).not.toHaveBeenCalled();
  });

  it('rejette un provider falsifie (400)', async () => {
    const res = await POST(makeReq({
      ...BASE_BODY,
      shippingMethod: 'click_collect',
      shippingCountry: 'FR',
      pickupPoint: { provider: 'mondial_relay', id: 'pt-1' },
    }));
    expect(res.status).toBe(400);
    expect(sessionCreateMock).not.toHaveBeenCalled();
  });

  it('accepte un C&C valide et remet a plat le snapshot depuis la BD', async () => {
    pickupPointRow.value = {
      id: 'pt-1', name: 'Boutique du Marais', address: '12 rue des Archives',
      postal_code: '75004', city: 'Paris', country: 'FR',
      hours: 'Lun-Sam 10h-19h', instructions: 'Demandez Lola', is_active: true,
    };
    const res = await POST(makeReq({
      ...BASE_BODY,
      shippingMethod: 'click_collect',
      shippingCountry: 'FR',
      // snapshot client volontairement falsifie : doit etre ignore au profit de la BD
      pickupPoint: { provider: 'click_collect', id: 'pt-1', name: 'FAKE', address: 'FAKE', postalCode: '00000', city: 'FAKE', country: 'FR' },
    }));
    expect(res.status).toBe(200);
    expect(sessionCreateMock).toHaveBeenCalledTimes(1);
    const params = sessionCreateMock.mock.calls[0][0];
    // shipping_address_collection omis pour C&C
    expect(params.shipping_address_collection).toBeUndefined();
    // metadata reconstruite depuis la BD ; clés plates snake = lookup webhook
    expect(params.metadata.shippingMethod).toBe('click_collect');
    expect(params.metadata.pickup_point_id).toBe('pt-1');
    expect(params.metadata.pickup_provider).toBe('click_collect');
    // snapshot JSON camelCase, distinct des clés plates snake
    const snap = JSON.parse(params.metadata.pickupPoint);
    expect(snap.name).toBe('Boutique du Marais'); // BD, pas 'FAKE'
    expect(snap.postalCode).toBe('75004');
  });
});
