import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { accountExportLimit, checkLimit } from '@/lib/security/ratelimit';

export const runtime = 'nodejs';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const limit = await checkLimit(accountExportLimit, `user:${user.id}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez plus tard.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  const email = user.email;
  const normalizedEmail = email?.trim().toLowerCase() ?? null;
  const admin = createAdminClient();

  try {
    const [profile, addresses, orders, reviews, favorites, giftCardsPurchased] = await Promise.all([
      admin.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      admin.from('addresses').select('*').eq('user_id', user.id),
      admin
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      admin.from('reviews').select('*').eq('user_id', user.id),
      admin.from('favorites').select('*').eq('user_id', user.id),
      normalizedEmail
        ? admin
            .from('gift_cards')
            .select('code, initial_amount, balance, recipient_email, recipient_name, message, status, created_at')
            .ilike('purchaser_email', normalizedEmail)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      account: {
        id: user.id,
        email,
        createdAt: user.created_at,
      },
      profile: profile.data ?? null,
      addresses: addresses.data ?? [],
      orders: orders.data ?? [],
      reviews: reviews.data ?? [],
      favorites: favorites.data ?? [],
      giftCardsPurchased: giftCardsPurchased.data ?? [],
      _legalNotice:
        'Cet export contient toutes les données personnelles que LOLETT détient à votre sujet, ' +
        "conformément à l'article 20 du RGPD (droit à la portabilité). " +
        'Les commandes peuvent être conservées sous forme anonymisée pour des obligations comptables ' +
        '(Code de commerce article L123-22, durée 10 ans).',
    };

    const filename = `lolett-export-${user.id}-${Date.now()}.json`;

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { route: 'account/export' },
      extra: { userId: user.id },
    });
    return NextResponse.json({ error: 'Erreur lors de l’export' }, { status: 500 });
  }
}
