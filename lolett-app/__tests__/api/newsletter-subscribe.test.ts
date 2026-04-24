import { describe, it, expect, vi } from 'vitest';

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
  });
});
