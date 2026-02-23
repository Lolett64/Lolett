import { NextResponse } from 'next/server';

const COOKIE_NAME = 'lolett_admin_token';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Admin not configured', debug: { hasEmail: !!adminEmail, hasPass: !!adminPassword } },
        { status: 500 }
      );
    }

    if (body.email !== adminEmail || body.password !== adminPassword) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
    }

    // Simple signed token using timestamp + secret
    const secret = process.env.ADMIN_TOKEN_SECRET || 'dev-fallback';
    const timestamp = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 15);
    const payload = `${timestamp}.${rand}`;

    // Simple hash without Node crypto (works in Edge)
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const signature = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

    const cookieValue = `${payload}.${signature}`;

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: 'Server error', detail: String(err) }, { status: 500 });
  }
}
