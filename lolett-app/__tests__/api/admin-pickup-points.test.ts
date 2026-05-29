import { describe, it, expect, vi, beforeEach } from 'vitest';

const { checkAdminMock, fromMock, rpcMock } = vi.hoisted(() => ({
  checkAdminMock: vi.fn(),
  fromMock: vi.fn(),
  rpcMock: vi.fn(),
}));

vi.mock('@/lib/admin/auth', () => ({
  checkAdminCookieFromRequest: checkAdminMock,
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: fromMock, rpc: rpcMock }),
}));

// Import AFTER mocks
import { GET, POST } from '@/app/api/admin/pickup-points/route';

function jsonReq(body: unknown, cookie = 'admin=ok'): Request {
  return new Request('http://x/api/admin/pickup-points', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify(body),
  });
}

describe('GET /api/admin/pickup-points', () => {
  beforeEach(() => {
    checkAdminMock.mockReset();
    fromMock.mockReset();
  });

  it('401 quand non authentifié', async () => {
    checkAdminMock.mockResolvedValue(false);
    const res = await GET(new Request('http://x/api/admin/pickup-points'));
    expect(res.status).toBe(401);
  });

  it('renvoie { pickupPoints } incluant les inactifs', async () => {
    checkAdminMock.mockResolvedValue(true);
    const rows = [
      { id: 'p1', name: 'A', is_active: true, sort_order: 0 },
      { id: 'p2', name: 'B', is_active: false, sort_order: 10 },
    ];
    fromMock.mockReturnValue({
      select: () => ({ order: () => Promise.resolve({ data: rows, error: null }) }),
    });
    const res = await GET(new Request('http://x/api/admin/pickup-points'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pickupPoints).toHaveLength(2);
    expect(json.pickupPoints[1].is_active).toBe(false);
  });
});

describe('POST /api/admin/pickup-points', () => {
  beforeEach(() => {
    checkAdminMock.mockReset();
    fromMock.mockReset();
  });

  it('401 quand non authentifié', async () => {
    checkAdminMock.mockResolvedValue(false);
    const res = await POST(jsonReq({ name: 'X', address: 'a', postalCode: '75001', city: 'Paris' }));
    expect(res.status).toBe(401);
  });

  it('400 sur payload invalide (name manquant)', async () => {
    checkAdminMock.mockResolvedValue(true);
    const res = await POST(jsonReq({ address: 'a', postalCode: '75001', city: 'Paris' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
    expect(json.details).toBeDefined();
  });

  it('initialise sort_order = MAX + 10 et renvoie { pickupPoint }', async () => {
    checkAdminMock.mockResolvedValue(true);
    // 1er from() : lecture du max sort_order
    // 2e from() : insert
    let insertedPayload: Record<string, unknown> | null = null;
    fromMock
      .mockReturnValueOnce({
        select: () => ({
          order: () => ({
            limit: () =>
              Promise.resolve({ data: [{ sort_order: 30 }], error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: (payload: Record<string, unknown>) => {
          insertedPayload = payload;
          return {
            select: () => ({
              single: () =>
                Promise.resolve({ data: { id: 'new', ...payload }, error: null }),
            }),
          };
        },
      });

    const res = await POST(
      jsonReq({ name: 'Boutique', address: '1 rue', postalCode: '75001', city: 'Paris' }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pickupPoint.id).toBe('new');
    expect(insertedPayload!.sort_order).toBe(40);
  });

  it('initialise sort_order = 10 quand la table est vide', async () => {
    checkAdminMock.mockResolvedValue(true);
    let insertedPayload: Record<string, unknown> | null = null;
    fromMock
      .mockReturnValueOnce({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: (payload: Record<string, unknown>) => {
          insertedPayload = payload;
          return {
            select: () => ({ single: () => Promise.resolve({ data: { id: 'n', ...payload }, error: null }) }),
          };
        },
      });
    const res = await POST(jsonReq({ name: 'X', address: 'a', postalCode: '75001', city: 'P' }));
    expect(res.status).toBe(200);
    expect(insertedPayload!.sort_order).toBe(10);
  });
});
