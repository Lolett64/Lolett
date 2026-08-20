import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/backup/storage', () => ({
  putBackup: vi.fn((path: string) => Promise.resolve({ path })),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: () => ({
        range: () =>
          Promise.resolve({ data: [{ table, id: '1' }], error: null }),
      }),
    }),
  }),
}));

import { GET } from '@/app/api/cron/backup/route';

describe('GET /api/cron/backup', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'test-secret';
  });

  it('rejects unauthorized requests', async () => {
    const req = new Request('http://x/api/cron/backup', {
      headers: {},
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('rejects requests with wrong secret', async () => {
    const req = new Request('http://x/api/cron/backup', {
      headers: { authorization: 'Bearer wrong-secret' },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 200 with valid cron secret', async () => {
    const req = new Request('http://x/api/cron/backup', {
      headers: { authorization: 'Bearer test-secret' },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.path).toContain('db/');
    expect(body.rows).toBeDefined();
  });

  it('refuses to run when CRON_SECRET is missing', async () => {
    delete process.env.CRON_SECRET;
    const req = new Request('http://x/api/cron/backup', {
      headers: { authorization: 'Bearer undefined' },
    });
    const res = await GET(req);
    expect(res.status).toBe(503);
  });
});
