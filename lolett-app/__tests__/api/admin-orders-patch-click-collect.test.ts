import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  checkAdminMock, fromMock, afterMock,
  assignPickupCodeAtomicMock, sendReadyMock, sendShippedMock, captureMessageMock,
} = vi.hoisted(() => ({
  checkAdminMock: vi.fn(),
  fromMock: vi.fn(),
  afterMock: vi.fn((cb: () => unknown) => { void cb(); }),
  assignPickupCodeAtomicMock: vi.fn(),
  sendReadyMock: vi.fn().mockResolvedValue(undefined),
  sendShippedMock: vi.fn().mockResolvedValue({ success: true }),
  captureMessageMock: vi.fn(),
}));

vi.mock('next/server', async (orig) => {
  const actual = await orig<typeof import('next/server')>();
  return { ...actual, after: afterMock };
});
vi.mock('@/lib/admin/auth', () => ({ checkAdminCookieFromRequest: checkAdminMock }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: fromMock }) }));
vi.mock('@/lib/orders/pickup-code', () => ({ assignPickupCodeAtomic: assignPickupCodeAtomicMock }));
vi.mock('@/lib/email/order-ready-for-pickup', () => ({ sendOrderReadyForPickupEmail: sendReadyMock }));
vi.mock('@/lib/email/order-shipped', () => ({ sendOrderShipped: sendShippedMock }));
vi.mock('@/lib/email/order-delivered', () => ({ sendOrderDelivered: vi.fn().mockResolvedValue({ success: true }) }));
vi.mock('@/lib/email/order-cancelled', () => ({ sendOrderCancelled: vi.fn().mockResolvedValue({ success: true }) }));
vi.mock('@sentry/nextjs', () => ({ captureMessage: captureMessageMock, captureException: vi.fn() }));

import { PATCH } from '@/app/api/admin/orders/[id]/route';

const params = (id: string) => ({ params: Promise.resolve({ id }) });
function patchReq(body: unknown): Request {
  return new Request('http://x/api/admin/orders/o1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', cookie: 'admin=ok' },
    body: JSON.stringify(body),
  });
}

const CUSTOMER = { firstName: 'Marie', lastName: 'D', email: 'marie@ex.fr', phone: '06', address: 'a', city: 'Paris', postalCode: '75001' };

/** Mock fromMock pour un fetch initial de currentOrder donné. */
function mockCurrentOrder(order: Record<string, unknown>) {
  fromMock.mockReturnValue({
    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: order, error: null }) }) }),
  });
}

describe('PATCH /api/admin/orders/[id] — Click & Collect', () => {
  beforeEach(() => {
    checkAdminMock.mockReset().mockResolvedValue(true);
    fromMock.mockReset();
    assignPickupCodeAtomicMock.mockReset();
    sendReadyMock.mockClear();
    sendShippedMock.mockClear();
    captureMessageMock.mockClear();
  });

  it('rejette une transition non autorisée (400)', async () => {
    mockCurrentOrder({ id: 'o1', status: 'delivered', customer: CUSTOMER, shipping_method: 'home' });
    const res = await PATCH(patchReq({ status: 'paid' }), params('o1'));
    expect(res.status).toBe(400);
  });

  it('refuse ready_for_pickup sans point C&C valide (400)', async () => {
    mockCurrentOrder({
      id: 'o1', status: 'confirmed', customer: CUSTOMER,
      shipping_method: 'home', pickup_point: null,
    });
    const res = await PATCH(patchReq({ status: 'ready_for_pickup' }), params('o1'));
    expect(res.status).toBe(400);
    expect(assignPickupCodeAtomicMock).not.toHaveBeenCalled();
  });

  it('refuse ready_for_pickup si provider != click_collect (400)', async () => {
    mockCurrentOrder({
      id: 'o1', status: 'confirmed', customer: CUSTOMER,
      shipping_method: 'click_collect',
      pickup_point: { id: 'p1', name: 'B', provider: 'mondial_relay' },
    });
    const res = await PATCH(patchReq({ status: 'ready_for_pickup' }), params('o1'));
    expect(res.status).toBe(400);
  });

  it('ready_for_pickup valide : génère le code, pose timestamp, envoie l email', async () => {
    // NB : sur ce chemin, from() n'est appelé QU'UNE FOIS (fetch currentOrder).
    // Tout le reste passe par le mock assignPickupCodeAtomic (qui ne touche pas fromMock).
    mockCurrentOrder({
      id: 'o1', status: 'confirmed', customer: CUSTOMER,
      shipping_method: 'click_collect',
      pickup_point: { id: 'p1', name: 'Boutique du Marais', address: '3 rue', postalCode: '75004', city: 'Paris', provider: 'click_collect' },
    });
    assignPickupCodeAtomicMock.mockResolvedValue({
      code: 'LOL-A7K2X',
      updated: {
        id: 'o1', order_number: 'LOL-20260530-1', status: 'ready_for_pickup',
        customer: CUSTOMER,
        pickup_point: { id: 'p1', name: 'Boutique du Marais', provider: 'click_collect' },
      },
    });
    const res = await PATCH(patchReq({ status: 'ready_for_pickup' }), params('o1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.order.status).toBe('ready_for_pickup');
    expect(assignPickupCodeAtomicMock).toHaveBeenCalledWith(
      expect.anything(),
      'o1',
      expect.objectContaining({ status: 'ready_for_pickup', ready_for_pickup_at: expect.any(String) }),
    );
    expect(sendReadyMock).toHaveBeenCalledTimes(1);
    expect(sendReadyMock.mock.calls[0][0].pickupCode).toBe('LOL-A7K2X');
  });

  it('ready_for_pickup : 500 + Sentry si la génération du code échoue', async () => {
    mockCurrentOrder({
      id: 'o1', status: 'confirmed', customer: CUSTOMER,
      shipping_method: 'click_collect',
      pickup_point: { id: 'p1', name: 'B', provider: 'click_collect' },
    });
    assignPickupCodeAtomicMock.mockResolvedValue(null);
    const res = await PATCH(patchReq({ status: 'ready_for_pickup' }), params('o1'));
    expect(res.status).toBe(500);
    expect(captureMessageMock).toHaveBeenCalled();
    expect(captureMessageMock.mock.calls[0][1].tags).toMatchObject({
      feature: 'click_and_collect', step: 'generate_code',
    });
    expect(sendReadyMock).not.toHaveBeenCalled();
  });

  it('picked_up : pose picked_up_at et n envoie aucun email', async () => {
    let updatePayload: Record<string, unknown> | null = null;
    fromMock
      // fetch currentOrder
      .mockReturnValueOnce({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({
          data: { id: 'o1', status: 'ready_for_pickup', customer: CUSTOMER, shipping_method: 'click_collect' },
          error: null,
        }) }) }),
      })
      // update
      .mockReturnValueOnce({
        update: (payload: Record<string, unknown>) => {
          updatePayload = payload;
          return { eq: () => ({ select: () => ({ single: () => Promise.resolve({
            data: { id: 'o1', status: 'picked_up', order_number: 'LOL-1', customer: CUSTOMER },
            error: null,
          }) }) }) };
        },
      });
    const res = await PATCH(patchReq({ status: 'picked_up' }), params('o1'));
    expect(res.status).toBe(200);
    expect(updatePayload!.picked_up_at).toEqual(expect.any(String));
    expect(sendReadyMock).not.toHaveBeenCalled();
    expect(sendShippedMock).not.toHaveBeenCalled();
  });
});
