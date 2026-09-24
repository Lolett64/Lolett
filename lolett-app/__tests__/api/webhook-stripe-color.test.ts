import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  constructEventMock,
  sendOrderConfirmationMock,
  orderCreateMock,
  ordersUpdateEqMock,
  pickupPointValue,
  captureMessageMock,
} = vi.hoisted(() => ({
  constructEventMock: vi.fn(),
  sendOrderConfirmationMock: vi.fn().mockResolvedValue({ success: true }),
  orderCreateMock: vi.fn().mockResolvedValue({ id: 'order-1', orderNumber: 'LOL-TEST' }),
  ordersUpdateEqMock: vi.fn().mockResolvedValue({ data: null, error: null }),
  pickupPointValue: { value: null as null | Record<string, unknown> },
  captureMessageMock: vi.fn(),
}));

// `after()` (next/server) lève "called outside a request scope" hors runtime
// Next. On le neutralise (exécute le callback en best-effort) tout en
// conservant NextResponse/NextRequest réels.
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return {
    ...actual,
    after: (cb: () => unknown) => {
      try {
        void cb();
      } catch {
        // no-op en test
      }
    },
  };
});

vi.mock('stripe', () => ({
  // Stripe est instancié via `new Stripe(...)` → le default doit être un
  // constructeur. vitest 4 exige une vraie classe/fonction (pas une arrow).
  default: class {
    webhooks = { constructEvent: constructEventMock };
  },
}));

vi.mock('@sentry/nextjs', () => ({
  captureMessage: captureMessageMock,
  captureException: vi.fn(),
}));

vi.mock('@/lib/adapters/supabase', () => ({
  // Instancié via `new SupabaseOrderRepository()` → doit être une vraie classe.
  SupabaseOrderRepository: class {
    create = orderCreateMock;
  },
}));

vi.mock('@/lib/email/order-confirmation', () => ({ sendOrderConfirmation: sendOrderConfirmationMock }));
vi.mock('@/lib/email/order-new-admin', () => ({ sendNewOrderAlertToAdmin: vi.fn() }));
vi.mock('@/lib/invoice/generate-invoice', () => ({ generateInvoicePdf: vi.fn().mockResolvedValue({ pdf: null }) }));
vi.mock('@/lib/orders/decrement-stock', () => ({ decrementStockForOrder: vi.fn() }));
vi.mock('@/lib/email-provider', () => ({ sendHtmlEmail: vi.fn() }));
vi.mock('@/lib/email/templates/gift-card-delivery-v3', () => ({ renderGiftCardDeliveryV3: vi.fn() }));
vi.mock('@/lib/email/templates/gift-card-purchase-confirmation-v3', () => ({ renderGiftCardPurchaseConfirmationV3: vi.fn() }));
vi.mock('@/lib/email/order-refunded', () => ({ sendOrderRefunded: vi.fn() }));
vi.mock('@/lib/email/dispute-alert', () => ({ sendDisputeAlertToAdmin: vi.fn(), sendDisputeClosedToAdmin: vi.fn() }));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'stripe_webhook_events') {
        return {
          insert: () => Promise.resolve({ error: null }),
          update: () => ({ eq: () => Promise.resolve({ error: null }) }),
          delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
        };
      }
      if (table === 'pickup_points') {
        // D3 : .maybeSingle() (pas .single()) côté webhook.
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: pickupPointValue.value, error: null }),
            }),
          }),
        };
      }
      if (table === 'orders') {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }),
          }),
          update: () => ({ eq: ordersUpdateEqMock }),
        };
      }
      return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }) };
    },
  }),
}));

import { POST } from '@/app/api/webhooks/stripe/route';
import { encodeItemsMetadata } from '@/lib/checkout/items-metadata';

function makeWebhookReq() {
  return new Request('http://x/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'stripe-signature': 'sig_test' },
    body: '{}',
  }) as unknown as import('next/server').NextRequest;
}

const BASE_METADATA = {
  items: JSON.stringify([{ productId: 'p1', productName: 'Robe', size: 'M', quantity: 1, price: 49.9 }]),
  customer: JSON.stringify({ firstName: 'Marie', lastName: 'D', email: 'm@x.fr', phone: '+33612345678', address: '1 rue', city: 'Paris', postalCode: '75001', country: 'France' }),
  total: '49.9',
  shipping: '0',
  shippingMethod: 'click_collect',
  shippingCountry: 'FR',
};

describe('Webhook Stripe — couleur des articles', () => {
  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_x';
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    sendOrderConfirmationMock.mockClear();
    orderCreateMock.mockClear();
  });

  it('recolle un panier découpé en plusieurs clés et enregistre la couleur de chaque article', async () => {
    const items = Array.from({ length: 8 }, (_, i) => ({
      productId: `p${i}`, productName: 'Tee shirt Mission', size: 'L', color: i % 2 ? 'Rose' : 'Beige', quantity: 1, price: 16.03,
    }));
    const { items: _legacy, ...rest } = BASE_METADATA;
    void _legacy;
    constructEventMock.mockReturnValueOnce({
      id: 'evt_color',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_color', payment_intent: 'pi_color', metadata: { ...rest, shippingMethod: 'home', ...encodeItemsMetadata(items) } } },
    });

    const res = await POST(makeWebhookReq());
    expect(res.status).toBe(200);
    expect(orderCreateMock).toHaveBeenCalledTimes(1);
    const created = orderCreateMock.mock.calls[0][0];
    expect(created.items).toHaveLength(8);
    expect(created.items[0].color).toBe('Beige');
    expect(created.items[1].color).toBe('Rose');
    const emailItems = sendOrderConfirmationMock.mock.calls[0][0].items;
    expect(emailItems[1].color).toBe('Rose');
  });

  it('accepte encore une ancienne session sans couleur (clé items seule)', async () => {
    constructEventMock.mockReturnValueOnce({
      id: 'evt_legacy',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_legacy', payment_intent: 'pi_legacy', metadata: { ...BASE_METADATA, shippingMethod: 'home' } } },
    });

    const res = await POST(makeWebhookReq());
    expect(res.status).toBe(200);
    expect(orderCreateMock).toHaveBeenCalledTimes(1);
    expect(orderCreateMock.mock.calls[0][0].items[0].color).toBeUndefined();
  });
});
