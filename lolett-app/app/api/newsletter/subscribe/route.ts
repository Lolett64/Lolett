import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWelcomeNewsletterEmail } from '@/lib/email/welcome-newsletter';

export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().email().max(254),
  source: z
    .enum(['home', 'editorial', 'contact', 'footer'])
    .optional()
    .default('home'),
});

export async function POST(req: NextRequest | Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const { email, source } = parsed.data;
  const supabase = createAdminClient();

  // Best-effort sync to Resend Audiences (swallow errors, DB stays source of truth)
  let resendContactId: string | null = null;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (audienceId && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data } = await resend.contacts.create({
        email,
        audienceId,
        unsubscribed: false,
      });
      resendContactId = data?.id ?? null;
    } catch (err) {
      console.warn('[newsletter] Resend Audiences create failed:', err);
    }
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert(
      { email, source, resend_contact_id: resendContactId },
      { onConflict: 'email', ignoreDuplicates: false },
    );

  if (error) {
    console.error('[newsletter] DB upsert failed:', error);
    return NextResponse.json({ error: 'Storage error' }, { status: 500 });
  }

  // Fire-and-forget welcome email
  sendWelcomeNewsletterEmail({ to: email }).catch((err) => {
    console.warn('[newsletter] welcome email failed:', err);
  });

  return NextResponse.json({ ok: true });
}
