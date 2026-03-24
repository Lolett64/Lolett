# Session State — 2026-03-24 21:35

## Branch
preview

## Completed This Session
- Catalogue réel: 56 produits avec photos cliente, noms retravaillés, catégories mises à jour
- Produits mixtes: Emoticoeurs dupliqués homme/femme avec photos appropriées
- Pages légales: mentions légales, CGV, confidentialité complétées (infos micro-entreprise Pau)
- Promotions: système prix soldés (compare_at_price) + admin soldes avec boutons %
- Codes promo: table DB + admin /admin/promos + API validation /api/promo/validate
- UI: photos object-contain, hero catégories aligné, badge -X% rouge

## Next Task
- Intégrer champ code promo dans le checkout (OrderSummary) côté client
- Tester flow soldes: appliquer un solde depuis admin et vérifier affichage
- Vérifier que admin product edit charge bien compare_at_price depuis la DB

## Blockers
None

## Key Context
- Migration SQL 20250101000005 appliquée sur Supabase (compare_at_price + promo_codes)
- Git config hooksPath corrigé (pointait vers mauvais chemin)
- Stripe checkout a déjà allow_promotion_codes: true
