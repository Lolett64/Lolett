import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { adminLoginLimit, getClientIp, checkLimit } from '@/lib/security/ratelimit';
import { ADMIN_COOKIE_NAME, signAdminPayload } from '@/lib/admin/token';

export async function POST(request: Request) {
  try {
    const limit = await checkLimit(adminLoginLimit, getClientIp(request));
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez plus tard.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
      );
    }

    const body = (await request.json()) as { email?: string; password?: string };
    const adminEmail = process.env.ADMIN_EMAIL;
    const rawHash = process.env.ADMIN_PASSWORD_HASH;
    const adminPasswordHash = rawHash
      ? rawHash.replace(/^['"]|['"]$/g, '')
      : undefined;
    if (rawHash && rawHash !== adminPasswordHash) {
      console.warn(
        '[admin/login] ADMIN_PASSWORD_HASH had surrounding quotes — stripped. Remove quotes from your env var.',
      );
    }

    if (!adminEmail || !adminPasswordHash) {
      console.error('[admin/login] ADMIN_EMAIL or ADMIN_PASSWORD_HASH is missing');
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    if (!body.email || !body.password) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
    }

    const emailMatches = body.email === adminEmail;
    const passwordMatches = await bcrypt.compare(body.password, adminPasswordHash);

    if (!emailMatches || !passwordMatches) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
    }

    const timestamp = Date.now().toString(36);
    const randBytes = new Uint8Array(12);
    crypto.getRandomValues(randBytes);
    const rand = Array.from(randBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const payload = `${timestamp}.${rand}`;
    const signature = await signAdminPayload(payload);
    const cookieValue = `${payload}.${signature}`;

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (e) {
    console.error('[admin/login] unexpected error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
