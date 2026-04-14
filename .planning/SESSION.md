# Session State — 2026-04-14 12:00

## Branch
preview (local) → pousse sur remote "client" (Lolett64/Lolett) pour Vercel

## Completed This Session
- Migration DB client : 28 migrations appliquées sur Supabase client (qczdwrudgmozyxkdidmr) ✅
- Code pushé sur GitHub client (Lolett64/Lolett) ✅
- Fix Resend lazy-init (lolett-app/lib/email-provider.ts) ✅
- Fix Supabase placeholder fallbacks (client.ts, server.ts, admin.ts) ✅

## Next Task
Vérifier que le build Vercel du commit 31b6929 a réussi, puis configurer les variables
manquantes dans Vercel UI (projet lolett64s-projects) :
- NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY + SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SITE_URL (ex: https://lolett.fr)
- RESEND_API_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
- Stripe : STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
- Brevo : BREVO_SMTP_HOST, BREVO_SMTP_PORT, BREVO_SMTP_USER, BREVO_SMTP_PASSWORD

## Blockers
Vercel MCP ne peut pas setter les env vars — doit se faire manuellement dans l'UI Vercel.
Stripe/Resend/Brevo : comptes encore sur les creds du développeur, à migrer vers client.

## Key Context
Root directory Vercel = "lolett-app" (sans espace). Déjà configuré manuellement.
Remote "client" = https://github.com/Lolett64/Lolett.git (remote "origin" = repo dev)
Supabase client project ID = qczdwrudgmozyxkdidmr
Valeurs .env.local du dev contiennent toutes les clés à copier/remplacer pour la cliente.
