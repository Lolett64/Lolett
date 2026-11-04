import { describe, it, expect, vi, beforeEach } from 'vitest';

const { fromMock, insertMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  insertMock: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: fromMock }),
}));

import { POST } from '@/app/api/admin/categories/route';

function req(body: unknown): Request {
  return new Request('http://x/api/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function mockInsertResult(result: { data: unknown; error: unknown }) {
  insertMock.mockReturnValue({ select: () => Promise.resolve(result) });
  fromMock.mockReturnValue({ insert: insertMock });
}

const base = { slug: 'pull-gilet', label: 'Pulls & Gilets', seo_title: '', seo_description: '' };

describe('POST /api/admin/categories', () => {
  beforeEach(() => {
    fromMock.mockReset();
    insertMock.mockReset();
  });

  it('Homme et Femme cochés : insère les deux catégories en une fois', async () => {
    mockInsertResult({ data: [{}, {}], error: null });
    const res = await POST(req({ ...base, genders: ['homme', 'femme'] }));

    expect(res.status).toBe(201);
    expect(insertMock).toHaveBeenCalledTimes(1);
    const rows = insertMock.mock.calls[0][0] as { gender: string; slug: string }[];
    expect(rows.map((r) => r.gender)).toEqual(['homme', 'femme']);
    expect(rows.every((r) => r.slug === 'pull-gilet')).toBe(true);
  });

  it('une seule case cochée : une seule catégorie', async () => {
    mockInsertResult({ data: [{}], error: null });
    await POST(req({ ...base, genders: ['femme'] }));
    expect(insertMock.mock.calls[0][0]).toHaveLength(1);
  });

  it('refuse sans genre coché', async () => {
    const res = await POST(req({ ...base, genders: [] }));
    expect(res.status).toBe(400);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('catégorie déjà existante : message clair (409)', async () => {
    mockInsertResult({ data: null, error: { code: '23505', message: 'duplicate key' } });
    const res = await POST(req({ ...base, genders: ['femme'] }));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toContain('existe déjà');
  });
});
