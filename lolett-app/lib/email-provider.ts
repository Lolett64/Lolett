import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import React from 'react';
import * as Sentry from '@sentry/nextjs';

// Ordre des providers : Brevo (HTTP API, fiable serverless) → SMTP Gmail
// (fallback, ~70% en serverless) → Resend (fallback final, mode test).
// On teste chaque provider dans l'ordre, on s'arrête au premier qui réussit.

const smtpTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

// Sender vérifié dans Brevo. Identique en prod et en dev pour éviter qu'un
// staging/preview avec NODE_ENV !== 'production' échoue silencieusement
// quand BREVO_API_KEY est présent (Brevo refuse les senders non vérifiés).
const DEFAULT_FROM = 'LOLETT <contact.lolett@gmail.com>';

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

interface SendOptions {
  from?: string;
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

interface SendReactOptions {
  from?: string;
  to: string;
  subject: string;
  react: React.ReactElement;
}

interface SendResult {
  success: boolean;
  error?: string;
}

// Parse "LOLETT <contact.lolett@gmail.com>" → { name: 'LOLETT', email: 'contact.lolett@gmail.com' }
// Brevo exige un objet { email, name? } et non une chaîne formatée.
function parseFromAddress(from: string): { email: string; name?: string } {
  const match = from.match(/^(.+?)\s*<(.+)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { email: from.trim() };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Erreurs réseau transientes qui valent un retry. Les erreurs HTTP (401, 4xx,
// 5xx) ne sont PAS dans cette liste : si Brevo répond 401, retry inutile.
const TRANSIENT_PATTERNS = [
  'fetch failed',           // undici timeout/connect error
  'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND',
  'EBUSY',                  // DNS lookup busy (vu sur Vercel Fluid Compute)
  'EAI_AGAIN',              // DNS résolu temporairement indisponible
  'socket hang up',
];

function isTransientNetworkError(message: string): boolean {
  return TRANSIENT_PATTERNS.some((p) => message.includes(p));
}

// Retry uniquement sur erreurs réseau transientes. Backoff exponentiel court
// (max ~2s total) pour rester sous le timeout serverless. Les erreurs API
// (HTTP 4xx/5xx) sont propagées immédiatement sans retry.
async function withRetry<T extends { success: boolean; error?: string }>(
  label: string,
  fn: () => Promise<T>,
  maxAttempts = 3,
): Promise<T> {
  let lastResult: T | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await fn();
    if (result.success) return result;
    lastResult = result;

    const isLast = attempt === maxAttempts;
    const transient = result.error ? isTransientNetworkError(result.error) : false;
    if (isLast || !transient) return result;

    const delayMs = attempt === 1 ? 500 : 1500;
    console.warn(`[Email][${label}] attempt ${attempt}/${maxAttempts} failed, retrying in ${delayMs}ms (${result.error})`);
    await sleep(delayMs);
  }
  return lastResult!;
}

async function sendViaBrevoOnce(opts: SendOptions): Promise<SendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'BREVO_API_KEY not configured' };
  }

  const sender = parseFromAddress(opts.from || DEFAULT_FROM);

  const body: Record<string, unknown> = {
    sender,
    to: [{ email: opts.to }],
    subject: opts.subject,
    htmlContent: opts.html,
  };

  if (opts.attachments?.length) {
    body.attachment = opts.attachments.map((a) => ({
      name: a.filename,
      content: a.content.toString('base64'),
    }));
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      const message = `Brevo HTTP ${res.status}: ${text.slice(0, 200)}`;
      console.error('[Email] Brevo error:', message);
      return { success: false, error: message };
    }

    console.log(`[Email] Sent via Brevo to ${opts.to}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Brevo error';
    console.error('[Email] Brevo failed:', message);
    return { success: false, error: message };
  }
}

async function sendViaBrevo(opts: SendOptions): Promise<SendResult> {
  return withRetry('Brevo', () => sendViaBrevoOnce(opts), 3);
}

async function sendViaSmtpOnce(opts: SendOptions): Promise<SendResult> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return { success: false, error: 'SMTP not configured' };
  }
  try {
    await smtpTransport.sendMail({
      from: opts.from || DEFAULT_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      attachments: opts.attachments,
    });
    console.log(`[Email] Sent via SMTP to ${opts.to}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'SMTP error';
    console.error('[Email] SMTP failed:', message);
    return { success: false, error: message };
  }
}

async function sendViaSmtp(opts: SendOptions): Promise<SendResult> {
  return withRetry('SMTP', () => sendViaSmtpOnce(opts), 2);
}

async function sendViaResend(opts: SendOptions): Promise<SendResult> {
  try {
    const { error } = await getResendClient().emails.send({
      from: opts.from || DEFAULT_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      attachments: opts.attachments?.map((a) => ({ filename: a.filename, content: a.content })),
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
 * Send HTML email — Brevo (primary) → SMTP Gmail → Resend
 */
export async function sendHtmlEmail(opts: SendOptions): Promise<SendResult> {
  const brevoResult = await sendViaBrevo(opts);
  if (brevoResult.success) return brevoResult;

  console.warn('[Email] Brevo failed, falling back to SMTP...');
  const smtpResult = await sendViaSmtp(opts);
  if (smtpResult.success) return smtpResult;

  console.warn('[Email] SMTP failed, falling back to Resend...');
  const resendResult = await sendViaResend(opts);
  if (resendResult.success) return resendResult;

  // Tous les providers ont échoué : alerte critique. La commande peut déjà
  // être marquée 'paid' en DB sans qu'aucun email n'ait été envoyé au client.
  Sentry.captureMessage('All email providers failed (Brevo + SMTP + Resend)', {
    level: 'fatal',
    extra: {
      to: opts.to,
      subject: opts.subject,
      brevoError: brevoResult.error,
      smtpError: smtpResult.error,
      resendError: resendResult.error,
    },
  });
  return resendResult;
}

/**
 * Send React email — renders to HTML then sends via dual provider
 */
export async function sendReactEmail(opts: SendReactOptions): Promise<SendResult> {
  const { render } = await import('@react-email/components');
  const html = await render(opts.react);

  return sendHtmlEmail({
    from: opts.from,
    to: opts.to,
    subject: opts.subject,
    html,
  });
}
