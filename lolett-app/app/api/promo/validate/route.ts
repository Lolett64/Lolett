import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { computePromoDiscount, type PromoType } from '@/lib/promo/discount';
import { promoLimit, getClientIp, checkLimit } from '@/lib/security/ratelimit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  const limit = await checkLimit(promoLimit, getClientIp(req));
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez plus tard.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  const { code, subtotal } = await req.json();

  if (!code) return NextResponse.json({ error: 'Code manquant' }, { status: 400 });

  const { data: promo, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('active', true)
    .single();

  if (error || !promo) {
    return NextResponse.json({ error: 'Code promo invalide' }, { status: 404 });
  }

  // Check expiration
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Ce code promo a expiré' }, { status: 400 });
  }

  // Check start date
  if (promo.starts_at && new Date(promo.starts_at) > new Date()) {
    return NextResponse.json({ error: 'Ce code promo n\'est pas encore actif' }, { status: 400 });
  }

  // Check usage limit
  if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
    return NextResponse.json({ error: 'Ce code promo a atteint sa limite d\'utilisation' }, { status: 400 });
  }

  // Check minimum order
  if (subtotal && promo.min_order > 0 && subtotal < promo.min_order) {
    return NextResponse.json({
      error: `Commande minimum de ${promo.min_order} € requise pour ce code`,
    }, { status: 400 });
  }

  // Calculate discount
  const discount = subtotal
    ? computePromoDiscount(promo.type as PromoType, Number(promo.value), Number(subtotal))
    : 0;

  return NextResponse.json({
    valid: true,
    code: promo.code,
    type: promo.type,
    value: promo.value,
    discount,
    description: promo.description,
  });
}
