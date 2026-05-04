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

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function getAdminTokenSecret(): string {
  const raw = process.env.ADMIN_TOKEN_SECRET;
  const secret = raw ? raw.replace(/^['"]|['"]$/g, '') : undefined;
  if (raw && secret !== raw) {
    console.warn(
      '[admin/token] ADMIN_TOKEN_SECRET had surrounding quotes — stripped. Remove quotes from your env var.',
    );
  }
  if (!secret || secret.length < 32) {
    throw new Error(
      'ADMIN_TOKEN_SECRET is missing or too short (need ≥ 32 chars). Refusing to operate with an insecure default.',
    );
  }
  return secret;
}

export async function verifyAdminToken(cookieValue: string): Promise<boolean> {
  const lastDot = cookieValue.lastIndexOf('.');
  if (lastDot === -1) return false;
  const payload = cookieValue.substring(0, lastDot);
  const signature = cookieValue.substring(lastDot + 1);
  const expected = await hmacSign(getAdminTokenSecret(), payload);
  return timingSafeEqual(signature, expected);
}

export async function signAdminPayload(payload: string): Promise<string> {
  return hmacSign(getAdminTokenSecret(), payload);
}

export function readAdminCookieFromHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
