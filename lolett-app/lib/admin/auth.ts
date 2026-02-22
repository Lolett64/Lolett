import { cookies } from 'next/headers';
import { createHmac, randomBytes } from 'crypto';

const COOKIE_NAME = 'lolett_admin_token';
const SECRET = process.env.ADMIN_TOKEN_SECRET || 'dev-fallback-change-in-production';

function signToken(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('hex');
}

function generateToken(): { token: string; signature: string } {
  const token = randomBytes(32).toString('hex');
  const signature = signToken(token);
  return { token, signature };
}

function verifyToken(cookieValue: string): boolean {
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return false;
  const [token, signature] = parts;
  const expectedSignature = signToken(token);
  // Timing-safe comparison
  if (signature.length !== expectedSignature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < signature.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  if (!token?.value) return false;
  return verifyToken(token.value);
}

export async function setAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  const { token, signature } = generateToken();
  cookieStore.set(COOKIE_NAME, `${token}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function checkAdminCookieFromRequest(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const parsedCookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...rest] = c.trim().split('=');
      return [key.trim(), rest.join('=')];
    })
  );
  const value = parsedCookies[COOKIE_NAME];
  if (!value) return false;
  return verifyToken(value);
}
