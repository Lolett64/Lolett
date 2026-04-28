# Session State — 2026-04-28 18:30

## Branch
preview (commit `5c9a3eb` pushé)

## Completed This Session
- Migration Supabase appliquée (orders + invoice_counter + next_invoice_number)
- Bucket Storage `invoices` créé (privé)
- Env Vercel Preview `NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID=BDTEST13` ajoutée
- Fix placeholder superposé sur Téléphone/Code postal (FloatingInput retire le placeholder visible)
- Fix widget MR : chargement séquentiel jQuery puis plugin via useEffect (au lieu de `<Script>` parallel) avec état loading/ready/error visible

## Next Task — Tester toute la chaîne MR sur le nouveau deploy

URL preview : `https://lolett-jzbeg4wuv-lolett64s-projects.vercel.app/checkout`

### Avant tests Stripe — mettre à jour webhook Stripe Test
Stripe (mode Test) → endpoint `Lolett preview - test mode` → URL :
`https://lolett-jzbeg4wuv-lolett64s-projects.vercel.app/api/webhooks/stripe?x-vercel-protection-bypass=FoUmv4vrLTXVrBY1bAVQAR9jRXW3fgkU`

### Scénarios à valider
1. **FR Domicile** — port 5,90€, email confirmation + facture PDF dans /admin/orders
2. **FR Mondial Relay** — widget s'affiche avec carte/points → sélection → port 4,90€ → email avec point relais + Maps + SMS mention
3. **ES Domicile** — autocomplete data.gouv désactivé, CP `28013` validé, port 9,90€
4. **BE Mondial Relay** — widget liste points Bruxelles, port 6,90€
5. **Validations** : MR sans pickup → bouton désactivé, CP `123` FR → erreur, tél vide → erreur
6. **Régression** : code promo `BIENVENUE10` toujours OK
7. **Admin** : encart "à recopier MR Pro" + lien facture PDF cliquable

## Blockers
- Webhook GitHub→Vercel cassé : redéploiements manuels via `vercel deploy --yes` depuis `/Users/trikilyes/Desktop/Privé/Lorett` (root, pas lolett-app/)
- Tarifs MR à valider avec la cliente (estimations publiques actuellement)
- Enseigne réelle MR à fournir avant prod (BDTEST13 = test public)

## Key Context
- Le widget MR utilise jQuery 3.6 + plugin v4_0 — chargement séquentiel obligatoire (pas en parallèle)
- `vercel deploy` doit être lancé depuis root du repo (pas depuis lolett-app/) sinon erreur de path
- Toutes les URL alias auto Vercel (`lolett-lolett64-...`) pointent sur Production = ANCIEN code, ne pas confondre avec preview
