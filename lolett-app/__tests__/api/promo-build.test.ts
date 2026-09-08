import { afterEach, expect, it, vi } from 'vitest';

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient }));
vi.mock('@/lib/security/ratelimit', () => ({
  promoLimit: null,
  getClientIp: () => 'test-ip',
  checkLimit: async () => ({ ok: true }),
}));
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

it('importe la route sans créer de client privilégié au build', async () => {
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
  vi.resetModules();
  const { POST } = await import('@/app/api/promo/validate/route');
  expect(createClient).not.toHaveBeenCalled();
  const response = await POST(new Request('http://localhost/api/promo/validate', {
    method: 'POST', body: JSON.stringify({ code: '' }),
  }));
  expect(response.status).toBe(400);
  expect(createClient).not.toHaveBeenCalled();
});

it('crée le client à la requête avec la configuration runtime', async () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'runtime-test-key');
  const query = { from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }) };
  createClient.mockReturnValue(query);
  const { POST } = await import('@/app/api/promo/validate/route');
  const response = await POST(new Request('http://localhost/api/promo/validate', {
    method: 'POST', body: JSON.stringify({ code: 'TEST' }),
  }));
  expect(response.status).toBe(404);
  expect(createClient).toHaveBeenCalledWith('https://example.supabase.co', 'runtime-test-key', expect.any(Object));
});
