import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, verifyAdminToken, readAdminCookieFromHeader } from './token';

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!token?.value) return false;
  return verifyAdminToken(token.value);
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function checkAdminCookieFromRequest(request: Request): Promise<boolean> {
  const value = readAdminCookieFromHeader(request.headers.get('cookie'));
  if (!value) return false;
  return verifyAdminToken(value);
}
