import { describe, it, expect, vi, beforeEach } from 'vitest';

// PR6 — cas limite : une dispute Stripe (charge.dispute.created) sur une commande
// Click & Collect doit se comporter EXACTEMENT comme sur une commande domicile :
// la branche dispute ne dépend ni de `shipping_method` ni de `pickup_point`.
// Ce test est une garantie de non-régression : le C&C ne casse pas le flux dispute.

const {
  constructEventMock,
  fromMock,
  sendDisputeAlertMock,
  sendDisputeClosedMock,
} = vi.hoisted(() => ({
  constructEventMock: vi.fn(),
  fromMock: vi.fn(),
  sendDisputeAlertMock: vi.fn().mockResolvedValue({ success: true }),
  sendDisputeClosedMock: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('stripe', () => ({
  // Stripe est instancié via `new Stripe(...)` → le default doit être un
  // constructeur (vraie classe, pas une arrow). Cohérent avec les autres tests C&C.
  default: class {
    webhooks = { constructEvent: constructEventMock };
  },
}));

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: fromMock }) }));

vi.mock('@/lib/email/dispute-alert', () => ({
  sendDisputeAlertToAdmin: sendDisputeAlertMock,
  sendDisputeClosedToAdmin: sendDisputeClosedMock,
}));

vi.mock('@sentry/nextjs', () => ({ captureMessage: vi.fn(), captureException: vi.fn() }));

// `after()` (next/server) lève "called outside a request scope" hors runtime Next.
// On exécute la callback en best-effort tout en conservant NextResponse/NextRequest réels.
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

import { POST } from '@/app/api/webhooks/stripe/route';

// Commande C&C disputée. La branche dispute (route.ts) :
//  - stripe_webhook_events : insert (idempotence, tête du handler) + update (markEventProcessed)
//  - orders : .select(...).eq('payment_id', ...).maybeSingle() puis .update(...).eq('id', ...)
function makeAdmin(captured: Array<Record<string, unknown>>) {
  return (table: string) => {
    if (table === 'stripe_webhook_events') {
      return {
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        delete: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      };
    }
    if (table === 'orders') {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: 'order-cc-1',
                order_number: 'LOL-CC-9',
                customer: { firstName: 'Marie', lastName: 'Dupont', email: 'marie.cc@test.com' },
                total: 49,
              },
              error: null,
            }),
          }),
        }),
        update: (payload: Record<string, unknown>) => {
          captured.push(payload);
          return { eq: vi.fn().mockResolvedValue({ error: null }) };
        },
      };
    }
    return { select: () => ({ eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }) }) };
  };
}

function disputeEvent() {
  return {
    id: `evt_${Math.random().toString(36).slice(2)}`,
    type: 'charge.dispute.created',
    data: {
      object: {
        id: 'dp_test_1',
        payment_intent: 'pi_test_cc_1',
        status: 'warning_needs_response',
        reason: 'fraudulent',
        amount: 4900, // centimes → 49€ après /100 dans le handler
        evidence_details: { due_by: Math.floor(Date.now() / 1000) + 7 * 86400 },
      },
    },
  };
}

function makeWebhookReq(event: unknown) {
  constructEventMock.mockReturnValue(event);
  return new Request('http://x/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'stripe-signature': 'sig_test' },
    body: JSON.stringify(event),
  }) as unknown as import('next/server').NextRequest;
}

describe('POST /api/webhooks/stripe — dispute sur commande Click & Collect (non-régression)', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_x';
    constructEventMock.mockReset();
    fromMock.mockReset();
    sendDisputeAlertMock.mockClear();
  });

  it('charge.dispute.created sur commande C&C → status disputed + dispute_id + alerte admin', async () => {
    const captured: Array<Record<string, unknown>> = [];
    fromMock.mockImplementation(makeAdmin(captured));

    const res = await POST(makeWebhookReq(disputeEvent()));

    expect(res.status).toBe(200);
    const upd = captured.find((u) => u.status === 'disputed');
    expect(upd).toBeTruthy();
    expect(upd?.dispute_id).toBe('dp_test_1');
    expect(upd?.dispute_reason).toBe('fraudulent');
    expect(upd?.dispute_amount).toBe(49);
    expect(sendDisputeAlertMock).toHaveBeenCalledTimes(1);
    const alertArg = sendDisputeAlertMock.mock.calls[0][0] as { orderNumber?: string };
    expect(alertArg.orderNumber).toBe('LOL-CC-9');
  });
});
