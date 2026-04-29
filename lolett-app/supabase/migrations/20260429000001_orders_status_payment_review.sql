-- Sécurité Tier 3 / Sprint 1 finding C2 (code review)
-- Ajoute le statut 'payment_review' à orders.status pour les cas où le débit
-- gift card échoue après que Stripe a encaissé (cf. /api/webhooks/stripe et
-- /api/checkout/stripe). Permet à Lola de filtrer ces incidents dans l'admin
-- au lieu de masquer derrière 'pending' ou 'cancelled'.

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending',
    'paid',
    'confirmed',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
    'expired',
    'payment_review'
  ));

COMMENT ON COLUMN public.orders.status IS
  'Workflow : pending → paid → confirmed → shipped → delivered. Branches : cancelled, refunded, expired. Incident : payment_review (Stripe a encaissé mais le débit gift card a échoué — intervention manuelle requise).';
