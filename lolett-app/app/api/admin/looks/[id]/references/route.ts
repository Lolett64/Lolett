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

  // Compter les produits liés au look (via look_products)
  const { count: productsCount, error: productsError } = await supabase
    .from('look_products')
    .select('id', { count: 'exact', head: true })
    .eq('look_id', id);

  const errors = [productsError].filter(Boolean);
  if (errors.length > 0) {
    console.error('[admin looks references] Supabase errors:', errors);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des dépendances' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    products: productsCount ?? 0,
  });
}
