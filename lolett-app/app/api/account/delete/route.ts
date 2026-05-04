import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { accountDeleteLimit, checkLimit } from '@/lib/security/ratelimit';

export const runtime = 'nodejs';

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', encoder.encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(request: Request) {
  let body: { confirm?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  if (body.confirm !== 'SUPPRIMER') {
    return NextResponse.json(
      { error: 'Confirmation requise (envoyer { confirm: "SUPPRIMER" })' },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const email = user.email;
  if (!email) {
    return NextResponse.json({ error: 'Compte sans email' }, { status: 400 });
  }

  const limit = await checkLimit(accountDeleteLimit, `user:${user.id}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez plus tard.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  const admin = createAdminClient();
  const normalizedEmail = email.trim();
  const emailHash = await sha256Hex(normalizedEmail.toLowerCase());

  const { data: rpcResult, error: rpcError } = await admin.rpc('delete_user_account_atomic', {
    p_user_id: user.id,
    p_email: normalizedEmail,
    p_email_hash: emailHash,
  });

  if (rpcError) {
    Sentry.captureException(rpcError, {
      tags: { route: 'account/delete', step: 'rpc' },
      extra: { userId: user.id },
    });
    return NextResponse.json(
      { error: 'Erreur lors de la suppression. Réessayez plus tard.' },
      { status: 500 },
    );
  }

  const result = rpcResult as { success: boolean; reason?: string };
  if (!result.success) {
    return NextResponse.json(
      { error: 'Suppression refusée', reason: result.reason },
      { status: 400 },
    );
  }

  // Toutes les données métier sont supprimées/anonymisées dans la transaction.
  // Reste à supprimer le user dans auth.users (hors transaction Postgres).
  const { error: deleteAuthError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteAuthError) {
    // Cas critique : la cascade DB est faite, mais auth.users n'est pas vidé.
    // On retourne 500 pour que l'UI affiche une erreur claire (pas de fausse réussite).
    // L'alerte Sentry fatal déclenche la purge manuelle de auth.users côté Lola.
    Sentry.captureException(deleteAuthError, {
      level: 'fatal',
      tags: { route: 'account/delete', step: 'auth_delete' },
      extra: { userId: user.id, emailHash },
    });
    return NextResponse.json(
      {
        error:
          'Suppression partielle. Vos données ont été effacées mais votre identifiant subsiste. Contactez le support.',
      },
      { status: 500 },
    );
  }

  // signOut local : efface le cookie côté serveur (la session JWT est déjà invalidée
  // par admin.deleteUser, mais le cookie peut traîner).
  await supabase.auth.signOut({ scope: 'local' });

  return NextResponse.json({ ok: true });
}
