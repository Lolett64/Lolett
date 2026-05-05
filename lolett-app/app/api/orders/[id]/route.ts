import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';
import { createClient } from '@/lib/supabase/server';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionId = req.nextUrl.searchParams.get('session_id');

  const orderRepo = new SupabaseOrderRepository();
  const order = await orderRepo.findById(id);

  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  // Mode 1 — User connecté : vérifie qu'il est bien le owner
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    if (order.userId !== user.id) {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }
    return NextResponse.json(order);
  }

  // Mode 2 — Guest avec session_id Stripe : valide via Stripe API
  // Le order.paymentId DOIT correspondre au payment_intent de la session
  // (lien posé par fulfillOrder lors de la création de la commande).
  // Si STRIPE_SECRET_KEY manque (misconfig), getStripe() jettera et le
  // try/catch loggera l'erreur — meilleur signal qu'un 401 silencieux.
  if (sessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return NextResponse.json({ error: 'Paiement non finalisé' }, { status: 402 });
      }

      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;

      if (!paymentIntentId || paymentIntentId !== order.paymentId) {
        return NextResponse.json({ error: 'Session invalide' }, { status: 403 });
      }

      return NextResponse.json(order);
    } catch (err) {
      console.error('[GET /api/orders/:id] Stripe session validation failed:', err);
      return NextResponse.json({ error: 'Session invalide' }, { status: 403 });
    }
  }

  // Aucun mode d'auth valide
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
}
