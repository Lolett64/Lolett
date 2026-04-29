import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ServiceStatus = 'ok' | 'down';

async function checkStripe(signal: AbortSignal): Promise<ServiceStatus> {
  if (!process.env.STRIPE_SECRET_KEY) return 'down';
  try {
    const res = await fetch('https://api.stripe.com/v1/balance', {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      signal,
    });
    return res.ok ? 'ok' : 'down';
  } catch {
    return 'down';
  }
}

async function checkSupabase(): Promise<ServiceStatus> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from('products').select('id').limit(1);
    return error ? 'down' : 'ok';
  } catch {
    return 'down';
  }
}

async function checkResend(signal: AbortSignal): Promise<ServiceStatus> {
  if (!process.env.RESEND_API_KEY) return 'down';
  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      signal,
    });
    return res.ok ? 'ok' : 'down';
  } catch {
    return 'down';
  }
}

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const [stripe, supabase, resend] = await Promise.all([
      checkStripe(controller.signal),
      checkSupabase(),
      checkResend(controller.signal),
    ]);

    const status = { stripe, supabase, resend };
    const allOk = stripe === 'ok' && supabase === 'ok' && resend === 'ok';

    return NextResponse.json(
      { status: allOk ? 'ok' : 'degraded', services: status, checkedAt: new Date().toISOString() },
      { status: allOk ? 200 : 503 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
