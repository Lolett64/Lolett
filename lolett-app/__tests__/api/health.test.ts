import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        limit: () => Promise.resolve({ data: [{ id: '1' }], error: null }),
      }),
    }),
  }),
}));

import { GET } from '@/app/api/health/route';

const okResponse = (input: RequestInfo | URL, init?: RequestInit) => {
  void input;
  void init;
  return Promise.resolve(new Response('{}', { status: 200 }));
};
const fetchMock = vi.fn(okResponse);

function calledUrls(): string[] {
  return fetchMock.mock.calls.map(([input]) => String(input));
}

describe('GET /api/health', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    process.env.BREVO_API_KEY = 'xkeysib-test';
    delete process.env.RESEND_API_KEY;
    fetchMock.mockReset();
    fetchMock.mockImplementation(okResponse);
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('checks Brevo, the email provider actually used, and not Resend', async () => {
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.services).toEqual({ stripe: 'ok', supabase: 'ok', brevo: 'ok' });
    expect(calledUrls()).toContain('https://api.brevo.com/v3/account');
    expect(calledUrls().some((u) => u.includes('resend.com'))).toBe(false);
  });

  it('sends the Brevo key in the api-key header', async () => {
    await GET();
    const brevoCall = fetchMock.mock.calls.find(([input]) => String(input).includes('brevo.com'));
    expect(new Headers(brevoCall?.[1]?.headers).get('api-key')).toBe('xkeysib-test');
  });

  it('reports degraded when BREVO_API_KEY is missing', async () => {
    delete process.env.BREVO_API_KEY;
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.services.brevo).toBe('down');
  });

  it('reports degraded when Brevo rejects the key', async () => {
    fetchMock.mockImplementation((input: RequestInfo | URL) =>
      Promise.resolve(
        new Response('{}', { status: String(input).includes('brevo.com') ? 401 : 200 }),
      ),
    );
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.services.brevo).toBe('down');
  });
});
