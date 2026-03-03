# Transactional Emails — Design

## Goal
Add 3 transactional emails: order shipped, order delivered, abandoned cart reminder.

## Existing Infrastructure
- Dual provider: Brevo SMTP (primary) + Resend (fallback)
- CMS-driven templates via `email_settings` table + admin panel
- "Luxe Whisper" HTML design system (Cormorant Garamond, beige/gold palette)
- Order confirmation already working

## Email 1: Order Shipped
- **Trigger:** Admin sets order status to `shipped`
- **Content:** Order number, tracking link (optional), items recap, delivery address
- **Template:** `lib/email/templates/order-shipped-v3.ts`
- **Sender:** `lib/email/order-shipped.ts`
- **CMS key:** `order_shipped`

## Email 2: Order Delivered
- **Trigger:** Admin sets order status to `delivered`
- **Content:** Order number, review invitation, CTA "Donner mon avis"
- **Template:** `lib/email/templates/order-delivered-v3.ts`
- **Sender:** `lib/email/order-delivered.ts`
- **CMS key:** `order_delivered`

## Email 3: Abandoned Cart
- **Trigger:** Vercel cron (hourly), sends to users with cart > 24h old and no recent order
- **Content:** Cart items preview, CTA "Reprendre mon panier"
- **Template:** `lib/email/templates/cart-abandoned-v3.ts`
- **Sender:** `lib/email/cart-abandoned.ts`
- **Cron:** `app/api/cron/abandoned-carts/route.ts`
- **CMS key:** `cart_abandoned`
- **DB change:** Add `abandoned_email_sent_at` column to `cart_items` (prevent duplicates)

## Shared Patterns
- All templates use Luxe Whisper design (same as order-confirmation-v3)
- All sent via `sendHtmlEmail` (Brevo → Resend fallback)
- All editable via `/admin/emails`
- Supabase migration for new `email_settings` rows + cart_items column
