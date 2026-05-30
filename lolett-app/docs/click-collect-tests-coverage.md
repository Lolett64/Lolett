# Click & Collect — Matrice de couverture des tests (spec §13, scénarios A1–A10)

Ce document cartographie les 10 scénarios d'acceptation du Click & Collect : pour
chacun, le test qui le couvre (chemin de fichier) **ou** la procédure de
vérification manuelle en recette. Il accompagne PR6 (E2E + cas limites).

> Rappel : le paiement Stripe réel (redirection `checkout.stripe.com` + 3DS) n'est
> pas automatisable de façon déterministe en E2E local. Le parcours C&C E2E
> s'arrête au `POST /api/checkout/stripe` (payload intercepté) ; la suite
> post-paiement est couverte par des tests d'intégration vitest qui appellent
> directement les handlers de route avec un client admin mocké.

## Tableau de synthèse

| # | Scénario (spec §13) | Statut | Test / procédure |
|---|---------------------|--------|------------------|
| A1 | Cliente FR commande en C&C → confirmation + point + admin | Partiel auto | `e2e/click-collect.spec.ts` (payload `click_collect` + `pickupPoint` au POST stripe) ; `__tests__/checkout/fulfill-order-click-collect.test.ts` (point actif → `paid` + email confirmation). **Email réel reçu = manuel.** |
| A2 | Admin : bouton « Marquer prête au retrait » visible, page expédition masquée | Manuel | UI `/admin/orders/[id]` (rendu serveur PR4). Voir procédure ci-dessous. |
| A3 | `confirmed/paid → ready_for_pickup` : timestamp + `pickup_code` + email | Auto | `__tests__/api/admin-orders-patch-click-collect.test.ts` (« ready_for_pickup valide… ») |
| A4 | `ready_for_pickup → picked_up` : `picked_up_at` + **aucun email** | Auto | `__tests__/api/admin-orders-patch-click-collect.test.ts` (« picked_up : pose picked_up_at… ») |
| A5 | RGPD : commandes C&C anonymisées comme les autres | Manuel / hors périmètre | Flux RGPD existant inchangé. Voir procédure ci-dessous. |
| A6 | Client BE force C&C via DevTools → route Stripe `400` « FR uniquement » | Auto | `__tests__/api/checkout-stripe-click-collect.test.ts` (« rejette click_collect hors France », + point inconnu/inactif/provider falsifié) |
| A7 | Désactiver un point référencé par N commandes : modal + `is_active=false` | Auto (logique) + Manuel (UI) | `__tests__/api/admin-pickup-points-usage.test.ts` (RPC `count_orders_with_pickup_point`). Modal = manuel. |
| A8 | Édition du texte email « Prête au retrait » depuis `/admin/emails` | Manuel | Aperçu live avec `MOCK_PICKUP_DATA`. Voir procédure ci-dessous. |
| A9 | No-show : `RefundDialog` accepte `ready_for_pickup`, refund OK | Partiel auto | `__tests__/api/admin-orders-refund-ready-for-pickup.test.ts` (route `POST /refund` accepte `ready_for_pickup`). **`RefundDialog` UI = manuel.** |
| A10 | Webhook session C&C sans `pickup_point` valide → `payment_review`, Sentry, pas d'email | Auto | `__tests__/api/webhook-stripe-click-collect.test.ts` (« bascule payment_review + skip email… ») ; cas mid-order : `__tests__/checkout/fulfill-order-click-collect.test.ts` |

**Résumé :** A3, A4, A6, A7 (logique), A10 automatisés (intégration vitest).
A1 partiel auto (E2E payload + fulfill intégration), email réel manuel.
A9 partiel auto (route refund), `RefundDialog` manuel.
A2, A5, A8 = vérification manuelle (UI admin / RGPD / aperçu email live).

## Couverture E2E (spec §12.4) — `e2e/click-collect.spec.ts`

| Spec | Test E2E | Nature |
|------|----------|--------|
| §12.4.1 | « FR : choisir C&C + un point envoie click_collect + pickupPoint au POST /api/checkout/stripe » | Parcours jusqu'au POST stripe (payload intercepté). Paiement Stripe lui-même = manuel/recette. SKIP si aucun point actif seedé. |
| §12.4.2 | « MR → C&C reset le pickupPoint (aucun résidu Mondial Relay) » | Pur UI / store |
| §12.4.3 | « FR (C&C) → BE force shippingMethod=home et vide le point » | Pur UI / store |
| §6.1 | « l'option Click & Collect est visible en FR avec le coût "Offerte" et absente en BE » | Pur UI (`restrictTo:['FR']`) |

Les E2E ne sont **pas** exécutés par vitest (`vitest.config.ts` exclut `e2e/`).
Ils tournent en recette/CI via `npm run test:e2e` avec un serveur `npm run dev` et
au moins un `pickup_points` actif en zone FR (sinon le parcours complet SKIP).

## Cas limites couverts en intégration (vitest)

| Cas | Fichier |
|-----|---------|
| Webhook C&C point invalide → `payment_review` + skip email + Sentry (A10) | `__tests__/api/webhook-stripe-click-collect.test.ts` |
| Webhook C&C point valide → flow normal (`paid` + email) | `__tests__/api/webhook-stripe-click-collect.test.ts` |
| Point désactivé mid-order (entre paiement et fulfillment) → `payment_review` | `__tests__/checkout/fulfill-order-click-collect.test.ts` |
| Attaque DevTools BE + click_collect → `400` (A6) | `__tests__/api/checkout-stripe-click-collect.test.ts` |
| Reconstruction du snapshot pickup_point depuis la BD au checkout | `__tests__/api/checkout-stripe-click-collect.test.ts` |
| Transitions admin `ready_for_pickup` / `picked_up` + code + email (A3/A4) | `__tests__/api/admin-orders-patch-click-collect.test.ts` |
| Refund accepté depuis `ready_for_pickup` (A9) | `__tests__/api/admin-orders-refund-ready-for-pickup.test.ts` |
| Dispute Stripe sur commande C&C → `disputed` + alerte (non-régression) | `__tests__/api/webhook-dispute-click-collect.test.ts` |
| Génération atomique du `pickup_code` | `__tests__/orders/pickup-code.test.ts` |
| Comptage RPC des commandes par point (A7 logique) | `__tests__/api/admin-pickup-points-usage.test.ts` |

## Procédures de vérification manuelle (recette, `npm run dev`)

À exécuter au moins une fois avec une commande C&C de test en base.

- **A1 (email réel)** — déclencher une transition `ready_for_pickup` sur une
  commande C&C de test → l'email « Prête au retrait » est reçu avec le code et le
  point. La confirmation initiale C&C (post-paiement) mentionne « vous recevrez un
  email avec votre code ».
- **A2** — ouvrir `/admin/orders/[id]` d'une commande C&C `paid`/`confirmed` → le
  bouton « Marquer prête au retrait » est proposé, et le bloc « Étiquette
  d'expédition » est masqué pour une commande C&C.
- **A5** — déclencher la suppression RGPD d'un compte ayant une commande C&C → la
  commande est anonymisée comme une commande domicile (nom/email scrubbés) ; le
  snapshot `pickup_point` peut rester (donnée boutique, pas personnelle).
- **A7 (UI)** — dans `/admin/pickup-points`, tenter de désactiver un point
  référencé par ≥1 commande → le modal affiche « Référencé par N commandes —
  masquer plutôt que supprimer » et le toggle passe `is_active=false`.
- **A8** — `/admin/emails`, ouvrir le template `order_ready_for_pickup`, modifier
  le `body_text`, cliquer « Aperçu » → le rendu utilise `MOCK_PICKUP_DATA`. Sauver,
  puis déclencher une transition `ready_for_pickup` sur une commande de test →
  l'email reçu reflète le nouveau texte.
- **A9 (UI)** — ouvrir `RefundDialog` sur une commande C&C `ready_for_pickup` → le
  dialog autorise le remboursement (liste `REFUNDABLE_STATUSES` incluant
  `ready_for_pickup`).
- **§12.4.1 (parcours navigateur)** — `http://localhost:3000/checkout` avec un
  produit FR au panier : l'option « Retrait en boutique » est visible, la cliquer
  affiche la liste des points, en choisir un, le bouton « Payer » s'active.
  Onglet Network : le POST `/api/checkout/stripe` contient
  `shippingMethod:"click_collect"` + `pickupPoint.provider:"click_collect"`.
