import { describe, it, expect, vi, beforeEach } from 'vitest';

const { checkAdminMock, rpcMock } = vi.hoisted(() => ({
  checkAdminMock: vi.fn(),
  rpcMock: vi.fn(),
}));

vi.mock('@/lib/admin/auth', () => ({ checkAdminCookieFromRequest: checkAdminMock }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ rpc: rpcMock }) }));

import { GET } from '@/app/api/admin/pickup-points/[id]/usage/route';

const params = (id: string) => ({ params: Promise.resolve({ id }) });

describe('GET /api/admin/pickup-points/[id]/usage', () => {
  beforeEach(() => { checkAdminMock.mockReset(); rpcMock.mockReset(); });

  it('401 si non authentifié', async () => {
    checkAdminMock.mockResolvedValue(false);
    const res = await GET(new Request('http://x'), params('p1'));
    expect(res.status).toBe(401);
  });

  it('renvoie { count } depuis la RPC count_orders_with_pickup_point', async () => {
    checkAdminMock.mockResolvedValue(true);
    rpcMock.mockResolvedValue({ data: 3, error: null });
    const res = await GET(new Request('http://x'), params('p1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.count).toBe(3);
    expect(rpcMock).toHaveBeenCalledWith('count_orders_with_pickup_point', { point_id: 'p1' });
  });

  it('count = 0 si la RPC renvoie null', async () => {
    checkAdminMock.mockResolvedValue(true);
    rpcMock.mockResolvedValue({ data: null, error: null });
    const res = await GET(new Request('http://x'), params('p1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.count).toBe(0);
  });
});
