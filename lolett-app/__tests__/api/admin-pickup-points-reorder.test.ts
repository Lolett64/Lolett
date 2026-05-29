import { describe, it, expect, vi, beforeEach } from 'vitest';

const { checkAdminMock, fromMock } = vi.hoisted(() => ({
  checkAdminMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock('@/lib/admin/auth', () => ({ checkAdminCookieFromRequest: checkAdminMock }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: fromMock }) }));

import { POST } from '@/app/api/admin/pickup-points/reorder/route';

function reorderReq(body: unknown): Request {
  return new Request('http://x/api/admin/pickup-points/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/pickup-points/reorder', () => {
  beforeEach(() => { checkAdminMock.mockReset(); fromMock.mockReset(); });

  it('401 si non authentifié', async () => {
    checkAdminMock.mockResolvedValue(false);
    const res = await POST(reorderReq({ fromId: 'a', toId: 'b' }));
    expect(res.status).toBe(401);
  });

  it('400 si fromId ou toId manquant', async () => {
    checkAdminMock.mockResolvedValue(true);
    const res = await POST(reorderReq({ fromId: 'a' }));
    expect(res.status).toBe(400);
  });

  it('400 si fromId === toId', async () => {
    checkAdminMock.mockResolvedValue(true);
    const res = await POST(reorderReq({ fromId: 'a', toId: 'a' }));
    expect(res.status).toBe(400);
  });

  it('échange les sort_order des deux points et renvoie { pickupPoints }', async () => {
    checkAdminMock.mockResolvedValue(true);
    const updates: Array<{ id: string; sort_order: number }> = [];

    // from() est appelé : (1) select des 2 lignes, (2) update A, (3) update B, (4) select final liste
    fromMock
      // (1) lecture des deux sort_order
      .mockReturnValueOnce({
        select: () => ({
          in: () =>
            Promise.resolve({
              data: [
                { id: 'a', sort_order: 10 },
                { id: 'b', sort_order: 20 },
              ],
              error: null,
            }),
        }),
      })
      // (2) update A → sort_order de B
      .mockReturnValueOnce({
        update: (payload: { sort_order: number }) => ({
          eq: (_col: string, id: string) => {
            updates.push({ id, sort_order: payload.sort_order });
            return Promise.resolve({ error: null });
          },
        }),
      })
      // (3) update B → sort_order de A
      .mockReturnValueOnce({
        update: (payload: { sort_order: number }) => ({
          eq: (_col: string, id: string) => {
            updates.push({ id, sort_order: payload.sort_order });
            return Promise.resolve({ error: null });
          },
        }),
      })
      // (4) liste finale
      .mockReturnValueOnce({
        select: () => ({
          order: () =>
            Promise.resolve({
              data: [
                { id: 'b', sort_order: 10 },
                { id: 'a', sort_order: 20 },
              ],
              error: null,
            }),
        }),
      });

    const res = await POST(reorderReq({ fromId: 'a', toId: 'b' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pickupPoints).toHaveLength(2);
    // a prend l'ordre de b (20), b prend l'ordre de a (10)
    expect(updates).toContainEqual({ id: 'a', sort_order: 20 });
    expect(updates).toContainEqual({ id: 'b', sort_order: 10 });
  });

  it('404 si un des deux ids est introuvable', async () => {
    checkAdminMock.mockResolvedValue(true);
    fromMock.mockReturnValueOnce({
      select: () => ({ in: () => Promise.resolve({ data: [{ id: 'a', sort_order: 10 }], error: null }) }),
    });
    const res = await POST(reorderReq({ fromId: 'a', toId: 'ghost' }));
    expect(res.status).toBe(404);
  });
});
