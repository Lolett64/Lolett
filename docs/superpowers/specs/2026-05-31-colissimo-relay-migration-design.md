> # ⚠️ ABANDONNÉ — NE PAS IMPLÉMENTER
>
> **Décision du 04/06/2026 :** Lola garde **Mondial Relay** pour le point relais.
> La migration vers le point relais Colissimo décrite ci-dessous n'aura **pas** lieu.
> Document conservé uniquement comme trace de la réflexion — ne pas commencer à coder dessus.
> La livraison **domicile** reste en Colissimo (déjà en place) ; seuls les **libellés admin**
> ont été harmonisés Colissimo / Mondial Relay.

---
# Design — Migration point relais : Mondial Relay → Colissimo

**Date :** 2026-05-31
**Offre commerciale :** Option 1 « Manuelle » — 250 € (étiquettes générées à la main depuis l'espace Colissimo Pro, pas d'API d'étiquetage).
**Statut :** validé en brainstorming, en attente du « go » de Lola pour la **mise en ligne** (le retrait effectif de Mondial Relay).

---

## 1. Contexte & objectif

Le tunnel actuel propose **3 modes** :
- `home` — livraison à domicile, transporteur **déjà `colissimo`**.
- `mondial_relay` — point relais via widget jQuery Mondial Relay.
- `click_collect` — retrait boutique (FR only), livré récemment.

La livraison à domicile est donc **déjà** en Colissimo. La migration porte essentiellement sur **le point relais** : remplacer le point relais Mondial Relay par le **point relais Colissimo** (widget officiel), ajuster les tarifs, et nettoyer toutes les mentions Mondial Relay (emails, facture, CSP, page /livraison, aide admin).

## 2. Décisions actées

| Sujet | Décision |
|-------|----------|
| Modes cibles | `home` (Colissimo) + `colissimo_relay` (FR only) + `click_collect`. |
| Sélection point relais | **Widget officiel Colissimo** (identifiants Web Service de Lola). |
| Tarifs FR | **Inchangés** : domicile 5,90 € / point relais 4,90 € / gratuit ≥ 100 €. |
| Tarifs international | **Relevés au coût Colissimo** : domicile 14,90 € (BENELUX et IBERIA), **pas de livraison gratuite** à l'étranger, **pas de point relais** hors FR. |
| Structure des zones | Inchangée pour l'instant (FR / BENELUX / IBERIA). La fusion BENELUX+IBERIA en « Europe » reste **en attente du retour de Lola**. |
| Retrait Mondial Relay | **Gelé** jusqu'au « go » de Lola. Exécuté en une étape finale (le « swap »). |

## 3. Séquençage & stratégie de mise en ligne

On développe **toute** l'intégration sur une branche `feat/colissimo-relay`. On teste **en conditions réelles sur un déploiement preview Vercel** (Colissimo actif, MR retiré sur la branche). Quand Lola valide → **merge = go-live**. Tant qu'elle n'a pas confirmé, **on ne merge pas**.

Invariants :
- La cliente ne voit **jamais** Mondial Relay et Colissimo en même temps (pas de coexistence en prod).
- Mondial Relay n'est retiré qu'au merge.
- Le « swap » (retrait MR) est la **dernière étape, gelée** — voir §10.

> Prérequis preview : le déploiement preview doit avoir les variables d'env Colissimo WS + Stripe (test) + Brevo, sinon le widget et le paiement ne sont pas testables.

## 4. Modèle de données & types (additif, zéro migration DB)

On réutilise les colonnes existantes (`shipping_method`, `shipping_carrier`, `shipping_country`, `pickup_point` JSONB). Aucune migration SQL.

Dans `lib/types/domain.ts` :
- `SHIPPING_METHOD_VALUES` → ajouter `'colissimo_relay'`. `'mondial_relay'` **reste de façon permanente** (rétrocompat parsing).
- `SHIPPING_CARRIER_VALUES` → **inchangé** : le point relais Colissimo a pour carrier `'colissimo'` (déjà présent). On distingue domicile vs relais par le *method*, pas le carrier.
- `PickupPointProvider` → ajouter `'colissimo_relay'`. `'mondial_relay'` **reste de façon permanente**.

Dans `lib/constants.ts` — `SHIPPING_METHODS` (source unique de `VALID_SHIPPING_METHODS`) :
```ts
colissimo_relay: { id: 'colissimo_relay', label: 'Point Relais Colissimo', carrier: 'colissimo' },
```

Nouveau type `ColissimoRelayPickupPoint` (calqué sur `MondialRelayPickupPoint`) : `provider: 'colissimo_relay'`, `id`, `name`, `address`, `postalCode`, `city`, `country`, `lat?`, `lng?`, `hours?`.

`mapPickupPoint` ([supabase-mappers.ts:72-82](../../../lolett-app/lib/adapters/supabase-mappers.ts)) : étendre le fallback du discriminant pour gérer `colissimo_relay` (`shippingMethod === 'colissimo_relay' ? 'colissimo_relay' : ...`). Les nouvelles commandes stockent `provider` dans le JSONB, donc le fallback ne sert qu'aux snapshots legacy.

## 5. Tunnel / UI

- **Nouveau composant** `features/checkout/components/ColissimoRelayWidget.tsx`, calqué sur `MondialRelayWidget.tsx` : charge le widget officiel Colissimo, écrit le point sélectionné dans le store Zustand (`setPickupPoint`) via la même mécanique que MR / C&C.
- **Route serveur** `app/api/colissimo/widget-token/route.ts` : appelle l'auth Web Service Colissimo (identifiants `.env`) et renvoie un **token court** au widget. Le token est **mis en cache côté serveur** pour sa durée de vie (éviter le rate-limit Colissimo). Identifiants **jamais exposés** au navigateur.
- **Paramètre poids** : le widget filtre les points selon le poids du colis → on lui passe un **poids par défaut (500 g)**, suffisant pour des bijoux. Sans impact sur le tarif facturé (tarif plat).
- `ShippingMethodSelect.tsx` : l'option point relais pointe sur `colissimo_relay`, `restrictTo: ['FR']` (comme le C&C).
- `CheckoutForm.tsx` : rendu conditionnel du `ColissimoRelayWidget` (import dynamique) à la place du widget MR.

> Le reset de méthode/point au changement de pays ([store.ts:159](../../../lolett-app/features/cart/store.ts)) et au changement de méthode ([store.ts:160-165](../../../lolett-app/features/cart/store.ts)) protège déjà contre une sélection FR-relais conservée en international. Réutilisé tel quel.

## 6. Frais de port (`computeShippingCost` + `SHIPPING_RATES`)

`SHIPPING_RATES` :
```ts
FR:      { home: 5.90, mondial_relay: 4.90, colissimo_relay: 4.90, click_collect: 0 },
BENELUX: { home: 14.90, mondial_relay: 6.90 },   // pas de colissimo_relay (FR only)
IBERIA:  { home: 14.90, mondial_relay: 7.90 },    // pas de colissimo_relay (FR only)
```
`SHIPPING_FREE_THRESHOLD` : `FR: 100`, `BENELUX: null`, `IBERIA: null` (pas de gratuité à l'étranger).

**Garde anti-DevTools (correction review §4) :** `computeShippingCost` renvoie aujourd'hui `?? 0` si une méthode n'a pas de tarif pour une zone ([constants.ts:179](../../../lolett-app/lib/constants.ts)). Un `colissimo_relay` forcé en international donnerait donc port = 0. → Ajouter une garde FR-only qui **throw** pour `colissimo_relay` hors FR, sur le modèle du `click_collect` ([constants.ts:169-172](../../../lolett-app/lib/constants.ts)).

## 7. Stripe

La session Stripe ajoute déjà « Livraison » comme line item à partir de `computeShippingCost`. Comme on ne change que le montant et qu'on ajoute un *method*, ça suit automatiquement.

**Correction review §1 (piège C&C) — chemin inline `fulfillOrder` :**
- Ajouter `colissimo_relay` dans `SHIPPING_METHODS` garantit `VALID_SHIPPING_METHODS.includes('colissimo_relay')` ([session/route.ts:59](../../../lolett-app/app/api/checkout/stripe/session/route.ts)) → la méthode n'est plus écrasée par `home`.
- Le mapping carrier codé en dur ([session/route.ts:61-64](../../../lolett-app/app/api/checkout/stripe/session/route.ts)) : `colissimo_relay` tombe sur `else → 'colissimo'` (correct), mais on le **remplace par `getShippingCarrier(method)`** pour supprimer la duplication et éviter toute dérive future.
- Le snapshot `pickup_point` (metadata) est déjà générique → fonctionne pour `colissimo_relay` sans changement.
- **Test obligatoire** : parcours `colissimo_relay` complet via le chemin inline (page succès **avant** que le webhook ne fire).

## 8. Emails, facture & espace client

On **ajoute** la branche d'affichage `colissimo_relay` (mention transporteur **Colissimo** + modalités point relais) **à côté** des branches existantes dans :
- `lib/email/templates/order-confirmation-v3.ts`
- `lib/email/templates/order-shipped-v3.ts`
- `lib/invoice/template.tsx`
- timeline / affichage espace client

`getTrackingUrl` ([constants.ts:187-194](../../../lolett-app/lib/constants.ts)) : carrier `colissimo` → URL de suivi La Poste, déjà géré → aucun changement.

**Rétrocompat (correction review §3) :** on **garde** les branches `mondial_relay` pour que les anciennes commandes (historique, factures déjà émises, emails déjà partis) s'affichent toujours correctement. On arrête juste d'en créer.

## 9. Aide admin (workflow manuel quotidien)

`components/admin/ShippingLabelInfo.tsx` : remplacer le lien « connect Mondial Relay » par un **lien vers l'espace Colissimo Pro** + un rappel des infos à recopier à la main (adresse, **poids**, **format**) pour générer l'étiquette. C'est le cœur du fonctionnement « manuel » de l'offre.

## 10. Le « swap » Mondial Relay (étape finale GELÉE)

Exécuté uniquement au « go » de Lola, en un commit/merge. Contenu :
1. Retirer l'option `mondial_relay` de `ShippingMethodSelect`.
2. Retirer le rendu du `MondialRelayWidget` de `CheckoutForm` (+ suppression du composant).
3. Retirer le tarif `mondial_relay` de `SHIPPING_RATES`.
4. Retirer les domaines MR de la CSP (`next.config.ts`).
5. Retirer l'usage de `NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID`.
6. **Bumper le store Zustand en v4** (correction review §2) — migration v3→v4 qui reset les paniers `mondial_relay` périmés vers `home` ([store.ts:69-75](../../../lolett-app/features/cart/store.ts)).
7. Mettre à jour la page `/livraison` (tableau tarifs, mentions transporteur).
8. Adapter les tests E2E (`e2e/click-collect.spec.ts`) qui contiennent des assertions MR.

**Ne PAS retirer** (rétrocompat permanente) : `mondial_relay` des types/enums (`SHIPPING_METHOD_VALUES`, `SHIPPING_CARRIER_VALUES`, `PickupPointProvider`), les branches d'affichage MR (emails, facture, mappers), `getTrackingUrl` MR.

## 11. Tests

- **Unitaires** : `shipping.test.ts` (cas `colissimo_relay` FR + nouveaux prix international + garde throw hors FR), `use-checkout-pickup.test.ts` (`colissimo_relay` exige un point).
- **E2E Playwright** : parcours point relais Colissimo (sur preview).
- **Conditions réelles** (exigé par l'offre) : commande test + paiement Stripe test + tunnel complet sur le preview, **dont le parcours via le chemin inline** (§7), avant merge.

## 12. Variables d'environnement

| Variable | Usage | Note |
|----------|-------|------|
| `COLISSIMO_WS_LOGIN` | Auth widget point relais | serveur only, jamais committé |
| `COLISSIMO_WS_PASSWORD` | Auth widget point relais | serveur only, jamais committé |
| `NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID` | (existant) | retiré au swap (§10) |

## 13. Risques résiduels

- **CSP du widget Colissimo** : domaines exacts (`ws.colissimo.fr` + tuiles carte) à confirmer et **tester explicitement sur le preview** (un mauvais réglage = widget muet).
- **Tarif international à 14,90 €** : ~équilibre pour < 500 g, légère perte au-delà (1 kg = 19,39 €). Décision business assumée.
- **Détails techniques exacts du widget Colissimo** (URL script, endpoint d'auth, champs du callback) : à confirmer contre la doc d'intégration Colissimo / leur support pendant l'implémentation.

## 14. Hors scope

- API d'étiquetage Colissimo (génération automatique des étiquettes) — la génération reste **manuelle** (Option 1).
- Fusion des zones BENELUX/IBERIA — **en attente Lola**.
- Point relais hors France.
