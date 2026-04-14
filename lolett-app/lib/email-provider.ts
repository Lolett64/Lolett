import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import React from 'react';

// --- Brevo SMTP (primary) ---
const brevoTransport = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.BREVO_SMTP_PORT) || 587,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
});

// --- Resend (fallback) — instancié lazily pour éviter l'erreur au build ---
function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

const DEFAULT_FROM =
  process.env.NODE_ENV === 'production'
    ? 'LOLETT <contact@lolett.fr>'
    : 'LOLETT <onboarding@resend.dev>';

interface SendOptions {
  from?: string;
  to: string;
  subject: string;
  html: string;
}

interface SendReactOptions {
  from?: string;
  to: string;
  subject: string;
  react: React.ReactElement;
}

async function sendViaBrevo(opts: SendOptions): Promise<{ success: boolean; error?: string }> {
  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASSWORD) {
    return { success: false, error: 'Brevo SMTP not configured' };
  }
  try {
    await brevoTransport.sendMail({
      from: opts.from || DEFAULT_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    console.log(`[Email] Sent via Brevo to ${opts.to}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Brevo error';
    console.error('[Email] Brevo failed:', message);
    return { success: false, error: message };
  }
}

async function sendViaResend(opts: SendOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await getResendClient().emails.send({
      from: opts.from || DEFAULT_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (error) {
      console.error('[Email] Resend error:', error);
      return { success: false, error: error.message };
    }
    console.log(`[Email] Sent via Resend (fallback) to ${opts.to}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Resend error';
    console.error('[Email] Resend failed:', message);
    return { success: false, error: message };
  }
}

/**
 * Send HTML email — Brevo first, Resend fallback
 */
export async function sendHtmlEmail(opts: SendOptions): Promise<{ success: boolean; error?: string }> {
  const brevoResult = await sendViaBrevo(opts);
  if (brevoResult.success) return brevoResult;

  console.warn('[Email] Brevo failed, falling back to Resend...');
  return sendViaResend(opts);
}

/**
 * Send React email — renders to HTML then sends via dual provider
 */
export async function sendReactEmail(opts: SendReactOptions): Promise<{ success: boolean; error?: string }> {
  // Dynamic import to avoid bundling issues
  const { render } = await import('@react-email/components');
  const html = await render(opts.react);

  return sendHtmlEmail({
    from: opts.from,
    to: opts.to,
    subject: opts.subject,
    html,
  });
}
