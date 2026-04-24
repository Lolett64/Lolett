import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const admin = createAdminClient();

  const { data: cards, error } = await admin
    .from('gift_cards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Optional light join: count of redemptions per card
  const redemptionsByCard = new Map<string, number>();
  if (cards && cards.length > 0) {
    const ids = cards.map((c: { id: string }) => c.id);
    const { data: reds } = await admin
      .from('gift_card_redemptions')
      .select('gift_card_id')
      .in('gift_card_id', ids);
    if (reds) {
      for (const r of reds as { gift_card_id: string }[]) {
        redemptionsByCard.set(r.gift_card_id, (redemptionsByCard.get(r.gift_card_id) || 0) + 1);
      }
    }
  }

  const enriched = (cards || []).map((c: { id: string } & Record<string, unknown>) => ({
    ...c,
    redemptions_count: redemptionsByCard.get(c.id) || 0,
  }));

  return NextResponse.json(enriched);
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { id, action } = body as { id?: string; action?: string };

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'id requis' }, { status: 400 });
  }

  const admin = createAdminClient();

  if (action === 'cancel') {
    const { data, error } = await admin
      .from('gift_cards')
      .update({
        status: 'cancelled',
        balance: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
