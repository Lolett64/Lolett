import { describe, it, expect, vi, beforeEach } from 'vitest';

const { checkAdminMock, fromMock } = vi.hoisted(() => ({
  checkAdminMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock('@/lib/admin/auth', () => ({ checkAdminCookieFromRequest: checkAdminMock }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: fromMock }) }));

import { GET, PATCH } from '@/app/api/admin/pickup-points/[id]/route';

const params = (id: string) => ({ params: Promise.resolve({ id }) });

describe('GET /api/admin/pickup-points/[id]', () => {
  beforeEach(() => { checkAdminMock.mockReset(); fromMock.mockReset(); });

  it('401 si non authentifié', async () => {
    checkAdminMock.mockResolvedValue(false);
    const res = await GET(new Request('http://x'), params('p1'));
    expect(res.status).toBe(401);
  });

  it('renvoie { pickupPoint }', async () => {
    checkAdminMock.mockResolvedValue(true);
    fromMock.mockReturnValue({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { id: 'p1', name: 'A' }, error: null }) }) }),
    });
    const res = await GET(new Request('http://x'), params('p1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pickupPoint.id).toBe('p1');
  });

  it('404 quand introuvable', async () => {
    checkAdminMock.mockResolvedValue(true);
    fromMock.mockReturnValue({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'not found' } }) }) }),
    });
    const res = await GET(new Request('http://x'), params('nope'));
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/admin/pickup-points/[id]', () => {
  beforeEach(() => { checkAdminMock.mockReset(); fromMock.mockReset(); });

  it('400 sur isActive non booléen', async () => {
    checkAdminMock.mockResolvedValue(true);
    const req = new Request('http://x', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: 'yes' }),
    });
    const res = await PATCH(req, params('p1'));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.details).toBeDefined();
  });

  it('mappe isActive → is_active et renvoie { pickupPoint }', async () => {
    checkAdminMock.mockResolvedValue(true);
    let updatePayload: Record<string, unknown> | null = null;
    fromMock.mockReturnValue({
      update: (payload: Record<string, unknown>) => {
        updatePayload = payload;
        return { eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 'p1', is_active: false }, error: null }) }) }) };
      },
    });
    const req = new Request('http://x', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: false, hours: '9h-18h' }),
    });
    const res = await PATCH(req, params('p1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pickupPoint.is_active).toBe(false);
    expect(updatePayload!.is_active).toBe(false);
    expect(updatePayload!.hours).toBe('9h-18h');
  });
});
