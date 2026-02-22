import { NextResponse } from 'next/server';
import { setAdminCookie } from '@/lib/admin/auth';

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
  }

  if (body.email !== adminEmail || body.password !== adminPassword) {
    return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
  }

  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
