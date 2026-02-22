import { NextRequest, NextResponse } from 'next/server';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Auth check: user must be logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const orderRepo = new SupabaseOrderRepository();
  const order = await orderRepo.findById(id);

  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  // Verify the order belongs to this user
  if (order.userId !== user.id) {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  }

  return NextResponse.json(order);
}
