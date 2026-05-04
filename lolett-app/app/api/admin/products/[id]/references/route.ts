import { NextResponse } from 'next/server';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const [orderItemsRes, lookProductsRes, cartItemsRes, favoritesRes] = await Promise.all([
    supabase.from('order_items').select('id', { count: 'exact', head: true }).eq('product_id', id),
    supabase.from('look_products').select('id', { count: 'exact', head: true }).eq('product_id', id),
    supabase.from('cart_items').select('id', { count: 'exact', head: true }).eq('product_id', id),
    supabase.from('favorites').select('user_id', { count: 'exact', head: true }).eq('product_id', id),
  ]);

  const errors = [orderItemsRes.error, lookProductsRes.error, cartItemsRes.error, favoritesRes.error].filter(Boolean);
  if (errors.length > 0) {
    console.error('[admin products references] Supabase errors:', errors);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des dépendances' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    orders: orderItemsRes.count ?? 0,
    looks: lookProductsRes.count ?? 0,
    carts: cartItemsRes.count ?? 0,
    favorites: favoritesRes.count ?? 0,
  });
}
