import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
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
  let discount = 0;
  if (promo.type === 'percentage') {
    discount = subtotal ? Math.round(subtotal * (promo.value / 100) * 100) / 100 : 0;
  } else {
    discount = promo.value;
  }

  return NextResponse.json({
    valid: true,
    code: promo.code,
    type: promo.type,
    value: promo.value,
    discount,
    description: promo.description,
  });
}
