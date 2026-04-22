# Session State — 2026-04-22

## Branch
preview

## Completed This Session
- Bascule complète compte Lola : Supabase + Vercel env vars, prod stable
- Perf TTFB −85 à −95% : middleware ciblé, Static ISR, Supabase public client sans cookies
- Images hero : priority + sizes + bg color (évite flash vide)
- UI shop : hero raccourci (-90px) + texte centré vertical + hauteur uniforme catégories
- Audit sécurité : clés dev dans git inoffensives (projet dev à supprimer)

## Next Task
Appliquer le plan d'optimisation images : sharp + script de compression + endpoint upload.
Plan détaillé : ~/.claude/plans/quirky-watching-pnueli.md

## Blockers
- Env vars Stripe + Brevo à récupérer quand Lola les envoie
- Reset service_role key dev OU suppression projet Supabase dev (quand prod 100% stable)

## Key Context
Modifs non commitées : ShopContentV4.tsx + package.json/lock (probablement sharp déjà ajouté). Vérifier avant de continuer.
