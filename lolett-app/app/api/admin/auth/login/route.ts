import { NextResponse } from 'next/server';
import { setAdminCookie } from '@/lib/admin/auth';

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
  }

  if (body.password !== adminPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
