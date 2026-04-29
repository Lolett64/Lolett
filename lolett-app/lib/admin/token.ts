const COOKIE_NAME = 'lolett_admin_token';

async function hmacSign(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyAdminToken(cookieValue: string): Promise<boolean> {
  const lastDot = cookieValue.lastIndexOf('.');
  if (lastDot === -1) return false;
  const payload = cookieValue.substring(0, lastDot);
  const signature = cookieValue.substring(lastDot + 1);
  const secret = process.env.ADMIN_TOKEN_SECRET || 'dev-fallback';
  const expected = await hmacSign(secret, payload);
  return signature === expected;
}

export function readAdminCookieFromHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
