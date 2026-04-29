import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

  const admin = createAdminClient();
  const emailHash = await sha256Hex(email.toLowerCase().trim());

  const { data: rpcResult, error: rpcError } = await admin.rpc('delete_user_account_atomic', {
    p_user_id: user.id,
    p_email: email,
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
    // L'utilisateur ne pourra plus se reconnecter (profile supprimé, FK orphelin),
    // mais on doit alerter pour purge manuelle.
    Sentry.captureException(deleteAuthError, {
      level: 'fatal',
      tags: { route: 'account/delete', step: 'auth_delete' },
      extra: { userId: user.id, emailHash },
    });
    return NextResponse.json(
      {
        ok: true,
        warning: 'Compte supprimé partiellement. Contactez le support.',
      },
      { status: 200 },
    );
  }

  // Sign out (efface les cookies côté client)
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
