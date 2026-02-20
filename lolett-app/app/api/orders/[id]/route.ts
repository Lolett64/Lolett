import { NextRequest, NextResponse } from 'next/server';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderRepo = new SupabaseOrderRepository();
  const order = await orderRepo.findById(id);

  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  return NextResponse.json(order);
}
