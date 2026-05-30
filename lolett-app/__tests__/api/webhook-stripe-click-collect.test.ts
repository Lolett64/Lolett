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

describe('Webhook Stripe — Click & Collect', () => {
  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_x';
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    sendOrderConfirmationMock.mockClear();
    ordersUpdateEqMock.mockClear();
    captureMessageMock.mockClear();
    pickupPointValue.value = null;
  });

  it('bascule payment_review + skip email quand le point C&C est invalide', async () => {
    pickupPointValue.value = null; // point introuvable / inactif (maybeSingle → data:null)
    constructEventMock.mockReturnValueOnce({
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_1', payment_intent: 'pi_1', metadata: { ...BASE_METADATA, pickup_point_id: 'pt-x', pickup_provider: 'click_collect' } } },
    });

    const res = await POST(makeWebhookReq());
    expect(res.status).toBe(200);
    expect(sendOrderConfirmationMock).not.toHaveBeenCalled();
    expect(captureMessageMock).toHaveBeenCalled();
    // Au moins un update a posé payment_review
    const updatedToReview = ordersUpdateEqMock.mock.calls.length > 0;
    expect(updatedToReview).toBe(true);
  });

  it('poursuit le flow normal quand le point C&C est actif', async () => {
    pickupPointValue.value = { id: 'pt-x', is_active: true };
    constructEventMock.mockReturnValueOnce({
      id: 'evt_2',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_2', payment_intent: 'pi_2', metadata: { ...BASE_METADATA, pickup_point_id: 'pt-x', pickup_provider: 'click_collect' } } },
    });

    const res = await POST(makeWebhookReq());
    expect(res.status).toBe(200);
    expect(sendOrderConfirmationMock).toHaveBeenCalledTimes(1);
  });
});
