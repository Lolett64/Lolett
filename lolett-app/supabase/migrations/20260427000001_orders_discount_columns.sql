-- Add discount tracking columns to orders for promo codes and gift cards.
-- Required so the admin order detail page and confirmation emails can show
-- "Sous-total / Code promo / Carte cadeau / Total" lines accurately, and so
-- the order's `total` reflects the amount actually charged via Stripe.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS promo_code TEXT,
  ADD COLUMN IF NOT EXISTS promo_discount NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gift_card_code TEXT,
  ADD COLUMN IF NOT EXISTS gift_card_amount NUMERIC(10,2) DEFAULT 0;
