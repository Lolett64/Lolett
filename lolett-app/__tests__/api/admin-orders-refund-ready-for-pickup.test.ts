import { describe, it, expect, vi, beforeEach } from 'vitest';

const { checkAdminMock, fromMock } = vi.hoisted(() => ({
  checkAdminMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock('@/lib/admin/auth', () => ({ checkAdminCookieFromRequest: checkAdminMock }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: fromMock }) }));
vi.mock('@/lib/orders/refund-tracking', () => ({
  getAlreadyRefundedQtyMap: vi.fn().mockResolvedValue(new Map()),
  refundItemKey: (p: string, s: string, c: string | null) => `${p}|${s}|${c ?? ''}`,
}));

// On stub Stripe pour ne pas appeler le vrai SDK. Le but du test est la GARDE
// de statut (ready_for_pickup accepté), pas le flux Stripe complet.
vi.mock('stripe', () => ({
  default: class {
    refunds = { create: vi.fn().mockResolvedValue({ id: 're_1', amount: 1000 }) };
  },
}));

import { POST } from '@/app/api/admin/orders/[id]/refund/route';

const params = (id: string) => ({ params: Promise.resolve({ id }) });

function refundReq(body: unknown): Request {
  return new Request('http://x/api/admin/orders/o1/refund', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: 'admin=ok' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/orders/[id]/refund — statut ready_for_pickup', () => {
  beforeEach(() => {
    checkAdminMock.mockReset().mockResolvedValue(true);
    fromMock.mockReset();
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
  });

  it('accepte un remboursement (commercial_gesture) depuis ready_for_pickup (A9)', async () => {
    fromMock
      // fetch order
      .mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: {
                id: 'o1', payment_id: 'pi_1', payment_provider: 'stripe',
                total: 50, status: 'ready_for_pickup', refund_amount: null,
              },
              error: null,
            }),
          }),
        }),
      })
      // réservation préemptive refund_amount (update ... .is(...).select('id'))
      .mockReturnValueOnce({
        update: () => ({
          eq: () => ({
            is: () => ({ select: () => Promise.resolve({ data: [{ id: 'o1' }], error: null }) }),
          }),
        }),
      });

    const res = await POST(
      refundReq({ kind: 'commercial_gesture', amount: 10, reason: 'cliente non venue', nonce: 'abcd1234' }),
      params('o1'),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});
