# Stripe Webhook Integration — Design

## Problem
Without a webhook, if a user pays on Stripe but closes their browser before being redirected back, the order is never created despite money being charged.

## Solution
Add a Stripe webhook endpoint that listens for `checkout.session.completed` events and creates the order server-side, independently of the client redirect.

## Architecture
```
Stripe → POST /api/webhook/stripe → Verify signature → Process event
```

## Events
- `checkout.session.completed` — Payment succeeded → create order (if not already exists)

## Webhook Logic
1. Verify Stripe signature using `STRIPE_WEBHOOK_SECRET`
2. Parse event
3. On `checkout.session.completed`:
   - Check if order already exists by `payment_id` → skip if yes (idempotent)
   - Create order from session metadata (same logic as `/api/checkout/stripe/session`)
   - Clear cart, award loyalty points, send confirmation email
4. Return 200 OK

## File
- `app/api/webhook/stripe/route.ts`

## Config
- `STRIPE_WEBHOOK_SECRET` in `.env.local`

## No Breaking Changes
- Existing `/api/checkout/stripe/session` fallback remains intact
- Webhook becomes primary source of truth, success page is backup
- Both paths check for existing order before creating (idempotent)
