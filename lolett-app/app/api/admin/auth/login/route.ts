import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHmac, randomBytes } from 'crypto';

const COOKIE_NAME = 'lolett_admin_token';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
    }

    if (body.email !== adminEmail || body.password !== adminPassword) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
    }

    // Generate signed token
    const secret = process.env.ADMIN_TOKEN_SECRET || 'dev-fallback-change-in-production';
    const token = randomBytes(32).toString('hex');
    const signature = createHmac('sha256', secret).update(token).digest('hex');
    const cookieValue = `${token}.${signature}`;

    // Set cookie via response headers (more reliable than cookies() in route handlers)
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[admin-login] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
