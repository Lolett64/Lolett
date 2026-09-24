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
import { decodeItemsMetadata } from '@/lib/checkout/items-metadata';

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

describe('POST /api/checkout/stripe — couleur des articles', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    sessionCreateMock.mockClear();
  });

  it('transmet la couleur choisie dans la metadata de la session', async () => {
    const res = await POST(makeReq({
      ...BASE_BODY,
      items: [{ ...BASE_BODY.items[0], color: 'Rose' }],
      shippingMethod: 'home',
      shippingCountry: 'FR',
    }));
    expect(res.status).toBe(200);
    const params = sessionCreateMock.mock.calls[0][0];
    const items = JSON.parse(decodeItemsMetadata(params.metadata) ?? '[]');
    expect(items[0].color).toBe('Rose');
  });

  it('ignore une couleur invalide (trop longue) au lieu de la stocker', async () => {
    const res = await POST(makeReq({
      ...BASE_BODY,
      items: [{ ...BASE_BODY.items[0], color: 'x'.repeat(200) }],
      shippingMethod: 'home',
      shippingCountry: 'FR',
    }));
    expect(res.status).toBe(200);
    const params = sessionCreateMock.mock.calls[0][0];
    const items = JSON.parse(decodeItemsMetadata(params.metadata) ?? '[]');
    expect(items[0].color).toBeUndefined();
  });
});

describe('POST /api/checkout/stripe — garde-fous panier', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    sessionCreateMock.mockClear();
  });

  it('garde la couleur telle quelle (sans retirer d’espaces) pour retrouver le bon stock', async () => {
    const res = await POST(makeReq({
      ...BASE_BODY,
      items: [{ ...BASE_BODY.items[0], color: 'Rose ' }],
      shippingMethod: 'home',
      shippingCountry: 'FR',
    }));
    expect(res.status).toBe(200);
    const items = JSON.parse(decodeItemsMetadata(sessionCreateMock.mock.calls[0][0].metadata) ?? '[]');
    expect(items[0].color).toBe('Rose ');
  });

  it('refuse un panier de plus de 50 lignes (400)', async () => {
    const res = await POST(makeReq({
      ...BASE_BODY,
      items: Array.from({ length: 51 }, () => BASE_BODY.items[0]),
      shippingMethod: 'home',
      shippingCountry: 'FR',
    }));
    expect(res.status).toBe(400);
    expect(sessionCreateMock).not.toHaveBeenCalled();
  });
});
