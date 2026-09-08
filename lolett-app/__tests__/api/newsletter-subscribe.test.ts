import { beforeEach, describe, it, expect, vi } from 'vitest';

const { deferred } = vi.hoisted(() => ({ deferred: [] as Array<() => Promise<void>> }));
vi.mock('next/server', async (importOriginal) => ({
  ...await importOriginal<typeof import('next/server')>(),
  after: vi.fn((task: () => Promise<void>) => { deferred.push(task); }),
}));
beforeEach(() => { deferred.length = 0; vi.clearAllMocks(); });

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      upsert: vi.fn().mockResolvedValue({ data: { id: 'uuid-1' }, error: null }),
    }),
  }),
}));

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    contacts: { create: vi.fn().mockResolvedValue({ data: { id: 'res-1' } }) },
  })),
}));

vi.mock('@/lib/email/welcome-newsletter', () => ({
  sendWelcomeNewsletterEmail: vi.fn().mockResolvedValue({ success: true }),
}));

import { POST } from '@/app/api/newsletter/subscribe/route';
import { sendWelcomeNewsletterEmail } from '@/lib/email/welcome-newsletter';

describe('POST /api/newsletter/subscribe', () => {
  it('rejects malformed email', async () => {
    const req = new Request('http://x/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('rejects invalid JSON', async () => {
    const req = new Request('http://x/api/newsletter/subscribe', {
      method: 'POST',
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('accepts valid email and returns 200', async () => {
    const req = new Request('http://x/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'camille@ex.fr', source: 'home' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(sendWelcomeNewsletterEmail).not.toHaveBeenCalled();
    expect(deferred).toHaveLength(1);
    await deferred[0]();
    expect(sendWelcomeNewsletterEmail).toHaveBeenCalledWith({ to: 'camille@ex.fr' });
  });
});
