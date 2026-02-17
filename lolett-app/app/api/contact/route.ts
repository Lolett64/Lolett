import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { sendEmail } from '@/lib/email';
import { ContactNotification } from '@/lib/email-templates/contact-notification';
import { ContactAcknowledgment } from '@/lib/email-templates/contact-acknowledgment';

// Rate limiting: max 3 messages per IP per hour (in-memory, MVP-level)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count += 1;
  return false;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Corps de la requete invalide.' },
      { status: 400 }
    );
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      { success: false, error: 'Donnees invalides.' },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;

  // Protection honeypot: si le champ "website" est rempli, c'est un bot
  if (typeof data.website === 'string' && data.website.length > 0) {
    // Rejeter silencieusement
    return NextResponse.json({ success: true });
  }

  // Validation des champs requis
  const { name, email, subject, message } = data;

  if (
    typeof name !== 'string' || name.trim().length === 0 ||
    typeof email !== 'string' || email.trim().length === 0 ||
    typeof subject !== 'string' || subject.trim().length === 0 ||
    typeof message !== 'string' || message.trim().length === 0
  ) {
    return NextResponse.json(
      { success: false, error: 'Tous les champs sont requis.' },
      { status: 400 }
    );
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedSubject = subject.trim();
  const trimmedMessage = message.trim();

  // Validation format email
  if (!isValidEmail(trimmedEmail)) {
    return NextResponse.json(
      { success: false, error: 'Format email invalide.' },
      { status: 400 }
    );
  }

  // Rate limiting par IP
  const clientIp = getClientIp(request);
  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { success: false, error: 'Trop de messages. Reessaie dans une heure.' },
      { status: 429 }
    );
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('[Contact] ADMIN_EMAIL non defini dans les variables d\'environnement.');
    return NextResponse.json(
      { success: false, error: 'Configuration serveur manquante.' },
      { status: 500 }
    );
  }

  const sentAt = new Date().toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Envoi de la notification admin (best-effort)
  const notificationResult = await sendEmail({
    to: adminEmail,
    subject: `[LOLETT Contact] ${trimmedSubject}`,
    react: React.createElement(ContactNotification, {
      name: trimmedName,
      email: trimmedEmail,
      subject: trimmedSubject,
      message: trimmedMessage,
      sentAt,
    }),
  });

  if (!notificationResult.success) {
    console.error('[Contact] Echec envoi notification admin:', notificationResult.error);
  }

  // Envoi de l'accusé de réception au visiteur (best-effort)
  const ackResult = await sendEmail({
    to: trimmedEmail,
    subject: 'On a bien recu ton message — LOLETT',
    react: React.createElement(ContactAcknowledgment, {
      name: trimmedName,
    }),
  });

  if (!ackResult.success) {
    console.error('[Contact] Echec envoi accuse de reception:', ackResult.error);
  }

  // On retourne success même si les emails échouent (email = best-effort)
  return NextResponse.json({ success: true });
}
