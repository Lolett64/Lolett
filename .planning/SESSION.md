# Session State — 2026-04-15 16:00

## Branch
preview (local) → pousse sur remote "client" (Lolett64/Lolett) main

## Completed This Session
- Bandeau cookies RGPD aux couleurs Lolett (crème/bleu nuit) ✅
- Google Tag Manager conditionnel (GTM-NQF4X8KF) — charge uniquement après consentement analytics ✅
- Fix build Vercel : force-dynamic sur admin layout + admin-login layout ✅
- Responsive mobile : Hero CTA, LooksSection miniatures, ShopContent titres, HighBarV4 top bar ✅

## Next Task
Configurer les variables d'environnement dans Vercel UI (MCP Vercel non disponible) :
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SITE_URL, RESEND_API_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
- Stripe : STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
- Brevo : BREVO_SMTP_HOST, BREVO_SMTP_PORT, BREVO_SMTP_USER, BREVO_SMTP_PASSWORD
Puis vérifier que le build Vercel du dernier push (d0d9a9f) passe.

## Blockers
Vercel MCP non connecté — env vars à faire manuellement dans l'UI Vercel.
Stripe/Resend/Brevo : comptes encore sur les creds du développeur, à migrer vers client.

## Key Context
Root directory Vercel = "lolett-app". Remote "client" = Lolett64/Lolett.
Supabase client project ID = qczdwrudgmozyxkdidmr.
GTM ID = GTM-NQF4X8KF. Cookie consentement = lolett-consent (1 an).
