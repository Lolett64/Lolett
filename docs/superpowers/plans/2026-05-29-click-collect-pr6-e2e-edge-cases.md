# Click & Collect — PR6 : E2E & cas limites — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verrouiller la feature Click & Collect par 3 parcours E2E Playwright (parcours C&C complet, bascule MR→C&C, bascule FR→BE) + une batterie de tests d'intégration vitest sur les cas limites (webhook provider invalide, refund d'une commande `ready_for_pickup`, dispute Stripe sur commande C&C, attaque DevTools `BE`+`click_collect`, désactivation d'un point en cours de session), et cartographier les 10 scénarios d'acceptation A1–A10 du spec §13 (automatisé vs vérif manuelle).

**Architecture:** Les E2E vivent dans `lolett-app/e2e/click-collect.spec.ts` (Playwright, `testDir ./e2e`, `baseURL http://localhost:3000`, `webServer` = `npm run dev`) et réutilisent les helpers existants (`dismissCookieConsent`, le pattern `addFirstProductToCart` de `checkout.spec.ts`). Le paiement Stripe réel n'étant pas automatisable de façon fiable en CI (redirection vers `checkout.stripe.com` + 3DS), le parcours C&C complet **s'arrête à la redirection Stripe** côté E2E, et la partie post-paiement (succès → email/code → transitions admin) est couverte par les **tests d'intégration vitest** qui appellent directement les handlers de route (`POST` webhook, `PATCH` admin orders, `POST` refund) avec un `createAdminClient` mocké — exactement le pattern de `__tests__/api/newsletter-subscribe.test.ts`. Les cas limites sont des tests d'intégration vitest car ils dépendent d'états DB/Stripe impossibles à fabriquer de façon déterministe via le navigateur.

**Tech Stack:** Playwright (`@playwright/test`), Vitest (env jsdom, alias `@/`, setup `vitest.setup.ts`), pattern de mock `vi.hoisted()` + `vi.mock()` AVANT import du sujet, Zustand v5 (cart store), Next.js route handlers (`Request`/`NextRequest`/`NextResponse`).

---

## Notes de cadrage (corrections vs spec + cohérence inter-PR)

Écarts spec↔réalité qui impactent CETTE PR (la réalité du codebase fait foi). Les décisions de cohérence inter-PR (D1–D5) tranchées au niveau du chantier C&C sont reproduites ici et appliquées dans les Tasks et les liens-PR.

1. **Le paiement Stripe n'est PAS automatisable en E2E de façon fiable.** Le spec §12.4.1 décrit « paiement Stripe test → succès → email reçu ». En réalité `POST /api/checkout/stripe` (L527-529) crée une `checkout.session` Stripe et renvoie une URL `session.url` qui redirige vers le domaine hébergé `checkout.stripe.com` (hors de notre `baseURL`), avec saisie carte `4242 4242 4242 4242` + parfois 3DS. C'est non déterministe et hors périmètre Playwright local. **Décision : l'E2E « parcours C&C » vérifie tout jusqu'au POST `/api/checkout/stripe` inclus** (intercepté via `page.route` pour capturer le payload envoyé = preuve que `shippingMethod:'click_collect'` + `pickupPoint` partent bien), **sans suivre la redirection Stripe**. La suite (webhook → `paid` → email confirmation → `ready_for_pickup` + `pickup_code` + email → `picked_up`) est couverte par les tests d'intégration vitest des Tasks 4-5 (handlers appelés en direct). Justification écrite dans le fichier E2E.

2. **`shippingMethod` côté code est encore typé `'home' | 'mondial_relay'` dans `types/index.ts` ; `'click_collect'` est ajouté par PR2.** PR6 dépend de PR1-5 : tous les tests de PR6 supposent que `ShippingMethod` inclut `'click_collect'`, que `VALID_SHIPPING_METHODS` (webhook `route.ts` L21) et `VALID_METHODS` (checkout `route.ts` L20) l'incluent, que `computeShippingCost(subtotal,'FR','click_collect') → 0` et que `computeShippingCost(subtotal,'BE','click_collect')` **throw** (cf. spec §12.1). Si un test échoue parce que `'click_collect'` n'est pas reconnu, **c'est une régression PR2-5, pas un bug de test** : ne pas « corriger » le test, remonter à la PR concernée.

3. **`SHIPPING_RATES` réel ≠ spec §5.3.** Le code (`lib/constants.ts`) a `FR.mondial_relay = 4.90` (le spec écrit faussement 4.50 dans le bloc §5.3). PR2 transforme le type en `Partial<Record<ShippingMethod, number>>` par zone et ajoute `FR.click_collect = 0` (uniquement en zone FR). Les tests de PR6 qui touchent au coût C&C n'assertent que `=== 0` en FR (vrai par construction) — ils ne dépendent pas de la valeur exacte de `mondial_relay`. **Le test unitaire `computeShippingCost('BE','click_collect')` throw est attribué à PR2 (§12.1), PAS à PR6** : PR6 n'exerce pas directement ce throw (aucune des 10 Tasks ne l'appelle). Ne pas laisser croire que PR6 le couvre.

4. **`PickupPoint` devient une union discriminée par `provider` ('mondial_relay' | 'click_collect') en PR2.** Aujourd'hui `types/index.ts` est PLAT (pas de `provider`). Les tests de PR6 qui construisent un `PickupPoint` C&C DOIVENT inclure `provider: 'click_collect'`. Si le type n'a pas encore le champ, c'est que PR2 n'est pas mergée → bloquer.

5. **D2 — `REFUNDABLE_STATUSES` doit inclure `ready_for_pickup` pour A9, et c'est PR4 (pas PR5) qui recâble.** Aujourd'hui la route refund (`app/api/admin/orders/[id]/refund/route.ts` L36) liste en dur `['paid','confirmed','shipped','delivered','partially_refunded']` — **PAS** `ready_for_pickup` ; `RefundDialog.tsx` (~L52) a sa propre liste hardcodée. Le spec §13 A9 exige « `RefundDialog` accepte `ready_for_pickup` ». **Décision D2 : c'est PR4 (qui touche déjà les composants admin + le PATCH) qui remplace les deux listes hardcodées (route L36 ET `RefundDialog.tsx`) par l'import de `REFUNDABLE_STATUSES` depuis `@/lib/constants`** (où la constante inclut `ready_for_pickup`). PR5 n'y touche pas. PR6 écrit le test qui le PROUVE (Task 6) ; si la liste n'a pas été recâblée, le test échoue et signale le manque **PR4**. (Le test n'édite PAS la route — il consomme l'état attendu après PR4.)

6. **D4 — les transitions C&C du PATCH admin sont implémentées par PR4, PAS PR5.** Aujourd'hui `ORDER_STATUSES` de `PATCH /api/admin/orders/[id]` (L16-19) n'inclut ni `ready_for_pickup` ni `picked_up`, et `PatchSchema` (L21) les rejette via Zod. **Décision D4 : c'est PR4** qui étend l'enum `ORDER_STATUSES`/`PatchSchema` (ou consomme `ORDER_STATUS_VALUES`), branche les transitions `confirmed→ready_for_pickup`, `paid→ready_for_pickup`, `ready_for_pickup→picked_up` (filtrées par `ORDER_STATUS_TRANSITIONS`), l'auto-set `ready_for_pickup_at`/`picked_up_at`, la génération atomique du `pickup_code` (`assignPickupCodeAtomic`) et le déclenchement de l'email `sendOrderReadyForPickupEmail`. PR6 écrit les tests d'intégration qui le vérifient (Task 5) et **dépend donc de PR4 ET PR5** (PR4 pour A3/A4/A9 ; PR5 pour A6/A10). Tant que PR4 n'a pas étendu l'enum, le test « pending→picked_up = 400 » passe *par accident* (Zod rejette `picked_up` comme enum invalide → 400) ; une fois l'enum étendu, c'est `ORDER_STATUS_TRANSITIONS` qui doit produire le 400 (transition non autorisée depuis `pending`). Le test reste vert dans les deux cas, mais le 400 doit venir de la logique de transition après PR4.

7. **D5 — métadonnées Stripe : clés PLATES snake_case pour le lookup, snapshot JSON camelCase pour l'historique.** Le code checkout actuel écrit la metadata en `shippingMethod`/`shippingCarrier`/`shippingCountry`/`pickupPoint` (JSON camelCase, `route.ts` L463-481) et **n'écrit ni `pickup_point_id` ni `pickup_provider`**. Le webhook actuel lit `metadata.shippingMethod`/`metadata.shippingCountry`/`metadata.pickupPoint` (camelCase, `route.ts` L235-247). Le spec §10.1/§10.3 prévoit pour PR5 d'**ajouter** les clés plates `pickup_point_id` + `pickup_provider` (snake_case) **en plus** du snapshot JSON, et de faire le lookup webhook sur ces clés plates. **Décision D5 (à implémenter par PR5, vérifiée par PR6) :**
   - PR5 ajoute au checkout (`metadata`) les clés plates `pickup_point_id` (= `pickupPoint.id`) et `pickup_provider` (= `pickupPoint.provider`), **en conservant** le snapshot `pickupPoint` JSON (camelCase, `postalCode` etc.) pour l'historique de la commande.
   - Le webhook PR5 lit `session.metadata.shipping_method` (ou conserve `shippingMethod` ; voir ci-dessous), `session.metadata.pickup_point_id`, `session.metadata.pickup_provider` pour la **revalidation** C&C, et stocke le snapshot `pickupPoint` (parsé du JSON) dans `orders.pickup_point`.
   - **Cohérence du nom de clé méthode :** le webhook actuel lit `metadata.shippingMethod`. Le spec §10.3 écrit `metadata.shipping_method`. **Tranché pour PR6 :** les tests `buildEvent`/`makeAdmin` construisent la metadata avec **les deux jeux de clés** (`shippingMethod` ET `shipping_method`, plus `pickupPoint` JSON ET `pickup_point_id`/`pickup_provider` plats), pour ne pas présupposer le choix final de PR5. L'assertion porte sur le **comportement** (`payment_review` + skip email), pas sur la clé exacte lue. Une PR ne doit JAMAIS lire `metadata.pickupPoint.postal_code` (le snapshot JSON est camelCase) ni `metadata.pickup_point.id` (la clé plate est `pickup_point_id`).

8. **Le webhook `payment_review` pour C&C invalide est la responsabilité de PR5.** Le spec §12.2/§13 A10 exige : session C&C sans `pickup_point` valide (point inconnu, point `is_active=false`, ou provider invalide) → `status='payment_review'`, `Sentry.captureMessage(..., { tags:{ feature:'click_and_collect', step:'webhook' } })`, **aucun email confirmation**. Aujourd'hui le webhook (L240-247) parse `pickupPoint` sans revalider en DB. PR6 renforce/complète la couverture (Task 4) — les tests pilotent le comportement attendu après PR5.

9. **D3 — lookup `pickup_points` en `.maybeSingle()` partout (webhook ET checkout).** Le spec §10.2 (L806) et §10.3 (L832) montrent le lookup en `.single()`. **Décision D3 : la convention partagée est `.maybeSingle()`** (évite l'erreur PostgREST `PGRST116` sur 0 ligne, cohérent avec `assignPickupCodeAtomic` et avec les autres lookups du webhook qui sont déjà en `.maybeSingle()` — gift_cards L115, orders L258, promo L471, dispute L714). PR5 DOIT donc écrire les revalidations C&C (webhook + checkout) en `.maybeSingle()`. Les mocks de PR6 (`makeAdmin`) sont en `.maybeSingle()` — ils ne matcheront pas un handler écrit en `.single()`. Si le handler PR5 utilise `.single()`, c'est une violation de D3 → remonter à PR5, ne pas adapter le mock.

10. **Profondeur de mocking réelle du webhook `checkout.session.completed`.** Le handler ne fait PAS `admin.from('orders').insert()` directement : il instancie `new SupabaseOrderRepository().create(...)` (`route.ts` L270-286) qui crée **son propre** `createAdminClient()` interne et enchaîne `.from('orders').insert(...).select('*').single()` puis `.from('order_items').insert(orderItems)` (`lib/adapters/supabase-order.ts` L31-78). Sur le chemin **valide** (point OK), le handler appelle ensuite `decrementStockForOrder(order.id)` (createAdminClient interne), `generateInvoicePdf`, `sendOrderConfirmation`, `after(sendNewOrderAlertToAdmin)`, `markEventProcessed` (UPDATE `stripe_webhook_events`). **Conséquence pour PR6 :** nos tests webhook ne couvrent que le chemin **invalide** (→ `payment_review`, `return` précoce **avant** mark-paid/email) ; le chemin valide nécessiterait de mocker tout le pipeline paid (lourd, non déterministe) → A1 « point valide → paid + confirmation » reste en **vérif manuelle** (cf. cartographie Task 10). Pour le chemin invalide, on mocke `@/lib/adapters/supabase` (`SupabaseOrderRepository`) afin que `create()` n'aille pas chercher un vrai client, et on garde `createAdminClient` mocké pour la revalidation `pickup_points` + l'`update` `payment_review` + l'idempotence `stripe_webhook_events`.

11. **Contrat PR5 — ordre d'insertion de la revalidation C&C dans le webhook.** Le spec §10.3 dit « Dans `checkout.session.completed`, AVANT mark paid ». Concrètement, la revalidation C&C de PR5 s'insère **après** la création de l'order par `orderRepo.create(...)` (`route.ts` L270-286, donc le snapshot `pickup_point` est bien stocké en DB) et **avant** le `mark paid` (L358-366) : si le point est invalide → `update({ status:'payment_review' }).eq('id', order.id)`, `Sentry.captureMessage(...)`, puis `markEventProcessed` + `return 200` (skip mark-paid, skip `decrementStockForOrder`, skip `sendOrderConfirmation`, skip `after(sendNewOrderAlertToAdmin)`). C'est ce que les tests Task 4/9 vérifient : `payment_review` posé + `sendOrderConfirmation` jamais appelé. Documenté ici pour que le testeur sache distinguer « PR5 manquante » de « mock faux ».

12. **D1 — signature du sender `sendOrderReadyForPickupEmail`.** Export EXACT `sendOrderReadyForPickupEmail` (suffixe `Email`) depuis `@/lib/email/order-ready-for-pickup` (créé par PR3, branché dans le PATCH par PR4). Signature : `sendOrderReadyForPickupEmail(data): Promise<void>` où `data.pickupPoint: PickupPoint | null` (pas `ClickCollectPickupPoint` non-nullable). Guard interne (spec §9.2) : si `!data.pickupCode || !data.pickupPoint || data.pickupPoint.provider !== 'click_collect' || !data.pickupPoint.name` → `Sentry.captureMessage` + `return`. Ainsi PR4 peut appeler `sendOrderReadyForPickupEmail({ pickupPoint: updatedOrder.pickup_point, ... })` (où `updatedOrder.pickup_point` est `PickupPoint | null`) **sans narrowing ni cast** sans casser le type-check. Les mocks de PR6 renvoient `undefined` (void), pas `{ success: true }`, par fidélité au contrat.

13. **Pas de `data-testid` C&C garantis dans le DOM.** Les sélecteurs E2E des composants ajoutés par PR3 (`ShippingMethodSelect` étendu, `ClickCollectPicker`, liste de points) ne sont **pas vérifiés** par cette exploration. Tout sélecteur DOM dans les E2E est marqué `// À CONFIRMER À L'IMPLÉMENTATION (Grep le DOM réel de PR3)` et accompagné d'un fallback robuste (rôle/texte) quand possible. Ne PAS inventer un `data-testid` : le poser dans PR3 si besoin, ou Grep le composant réel au moment d'écrire le test.

14. **`localStorage` du panier : clé `lolett-cart`, persistée par Zustand `persist`.** Les E2E manipulent le panier via l'UI (ajout produit) puis lisent/écrivent `lolett-cart` pour asserter l'état (`shippingMethod`, `pickupPoint`) — pattern déjà utilisé dans `checkout.spec.ts` L30 (`localStorage.removeItem('lolett-cart')`). La structure persistée Zustand est `{ state: {...}, version: N }`. Le store réel est aujourd'hui `version: 2` (`features/cart/store.ts` L137) ; PR2 le passe à `3` (spec §5.5). L'injection localStorage de Task 2 met `version: 3` (post-PR2) ; Zustand relit `state` quel que soit le numéro, donc l'impact d'un décalage est cosmétique, mais on aligne sur PR2.

15. **`setShippingMethod` actuel ne reset PAS au passage MR→C&C.** Le store réel (`features/cart/store.ts` L118-121) ne vide `pickupPoint` que si `method === 'home'`. PR2 (spec §5.5) doit étendre le reset à **tout changement de méthode** (`state.shippingMethod !== method ? null : state.pickupPoint`). Le test E2E de Task 2 pilote ce comportement : si le point MR reste collé après bascule, c'est un manque PR2 → remonter, ne pas patcher le test.

---

## Pré-requis de vérification (avant toute écriture de test)

- [ ] **Vérifier que PR1-5 sont mergées et que `npm run type-check` est vert sur `main`.** PR6 ne compile pas sinon (`'click_collect'`, `provider`, `ready_for_pickup`, `picked_up`, etc.).
- [ ] **Grep les symboles attendus** pour confirmer leur présence (sinon, la PR amont manque) :
  - `'click_collect'` dans `lolett-app/lib/types/domain.ts` (`SHIPPING_METHOD_VALUES`) et `lolett-app/types/index.ts` (réexport + union `PickupPoint`).
  - `provider` dans l'union `PickupPoint` (`MondialRelayPickupPoint` / `ClickCollectPickupPoint`).
  - `'ready_for_pickup'` dans `REFUNDABLE_STATUSES` de `lolett-app/lib/constants.ts` (D2) ET dans l'import/consommation de cette constante par `lolett-app/app/api/admin/orders/[id]/refund/route.ts` (la ligne L36 hardcodée doit avoir été remplacée par l'import — responsabilité PR4).
  - `'ready_for_pickup'` / `'picked_up'` acceptés par le `PatchSchema`/`ORDER_STATUSES` de `lolett-app/app/api/admin/orders/[id]/route.ts` (D4 — responsabilité PR4).
  - Export EXACT `sendOrderReadyForPickupEmail` dans `lolett-app/lib/email/order-ready-for-pickup.ts` (PR3) ; le fichier **n'existe pas encore** aujourd'hui.
  - Lookup `pickup_points` en `.maybeSingle()` dans `lolett-app/app/api/webhooks/stripe/route.ts` ET `lolett-app/app/api/checkout/stripe/route.ts` (D3 — responsabilité PR5).
  - Clés metadata plates `pickup_point_id` / `pickup_provider` écrites dans `lolett-app/app/api/checkout/stripe/route.ts` (D5 — responsabilité PR5).
- [ ] Si l'un manque : **ne pas contourner** — remonter à la PR responsable (voir Notes de cadrage 5/6/7/9/12).

---

### Task 1: E2E — parcours C&C jusqu'à la redirection Stripe (spec §12.4.1, A1 partiel)

**Files:**
- Create: `lolett-app/e2e/click-collect.spec.ts`
- (Réutilise) `lolett-app/e2e/helpers.ts` (`dismissCookieConsent`)

**Approche :** réutiliser le pattern `addFirstProductToCart` de `checkout.spec.ts`. Aller au checkout, sélectionner `click_collect`, sélectionner un point, intercepter `POST /api/checkout/stripe` avec `page.route` pour capturer le payload (preuve que `shippingMethod:'click_collect'` + `pickupPoint` partent au serveur) et **court-circuiter** la vraie création de session Stripe (on renvoie une fausse `{ url }` pointant vers notre propre `/checkout` pour ne pas quitter le domaine). On asserte le payload, pas le paiement.

- [ ] **Step 1 — Écrire le squelette + helper panier + interception, test qui échoue (sélecteur C&C inconnu).** Créer `lolett-app/e2e/click-collect.spec.ts` :

```ts
import { test, expect } from '@playwright/test';
import { dismissCookieConsent } from './helpers';

// NOTE CADRAGE PR6 : le paiement Stripe réel (redirection checkout.stripe.com + 3DS)
// n'est pas automatisable de façon déterministe en E2E local. On vérifie donc le
// parcours C&C JUSQU'AU POST /api/checkout/stripe inclus (payload intercepté), puis
// on court-circuite la création de session. La suite (webhook -> paid -> email/code
// -> transitions admin) est couverte par les tests d'intégration vitest (Tasks 4-5).

// Helper panier — copié de checkout.spec.ts (pattern validé).
async function addFirstProductToCart(page: import('@playwright/test').Page) {
  await page.goto('/shop/femme');
  const firstProduct = page.locator('a[href*="/produit/"]').first();
  await expect(firstProduct).toBeVisible({ timeout: 10_000 });
  await firstProduct.click();
  await page.waitForURL('**/produit/**', { timeout: 15_000 });

  const sizeBtn = page
    .locator('button[aria-label^="Taille "]:not([aria-label*="indisponible"]):not([disabled])')
    .first();
  await expect(sizeBtn).toBeVisible({ timeout: 10_000 });
  await sizeBtn.click();

  const addBtn = page.getByRole('button', { name: 'Ajouter au panier' });
  await expect(addBtn).toBeEnabled({ timeout: 5_000 });
  await addBtn.click();
  await page.waitForTimeout(2_000);
}

// Sélectionne la méthode Click & Collect dans le checkout.
// À CONFIRMER À L'IMPLÉMENTATION (Grep le DOM réel de PR3 — ShippingMethodSelect) :
// le label/rôle exact de l'option C&C. Le spec §6.1 prévoit role="radio" dans un
// role="radiogroup" ; fallback texte ci-dessous, à ajuster.
async function selectClickCollect(page: import('@playwright/test').Page) {
  const ccOption = page.getByRole('radio', { name: /retrait en boutique|click ?& ?collect/i })
    .or(page.getByRole('button', { name: /retrait en boutique|click ?& ?collect/i }));
  await expect(ccOption.first()).toBeVisible({ timeout: 10_000 });
  await ccOption.first().click();
}

// Sélectionne le premier point de retrait proposé.
// À CONFIRMER À L'IMPLÉMENTATION (Grep le DOM réel de PR3 — composant ClickCollectPicker /
// liste des points). Fallback : premier bouton/radio sous le bloc C&C.
async function selectFirstPickupPoint(page: import('@playwright/test').Page) {
  const pointBtn = page
    .locator('[data-pickup-point], button[aria-label^="Point de retrait"], button[name="pickupPoint"]')
    .first();
  await expect(pointBtn).toBeVisible({ timeout: 10_000 });
  await pointBtn.click();
}

test.describe('Click & Collect — parcours complet', () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }) => {
    await dismissCookieConsent(page);
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('lolett-cart'));
    await addFirstProductToCart(page);
  });

  test('FR : choisir C&C + un point envoie click_collect + pickupPoint au POST /api/checkout/stripe', async ({ page }) => {
    // Intercepte la création de session Stripe pour capturer le payload SANS
    // partir sur checkout.stripe.com (hors domaine, non déterministe).
    let capturedBody: unknown = null;
    await page.route('**/api/checkout/stripe', async (route) => {
      capturedBody = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        // url interne -> ne quitte pas le domaine de test
        body: JSON.stringify({ url: 'http://localhost:3000/checkout?stubbed=1' }),
      });
    });

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Remplir le formulaire de livraison (pattern checkout.spec.ts).
    await page.locator('input[name="firstName"]').fill('Marie');
    await page.locator('input[name="lastName"]').fill('Dupont');
    await page.locator('input[name="email"]').fill('marie.cc@test.com');
    await page.locator('input[name="phone"]').fill('0612345678');
    await page.locator('input[name="address"]').fill('12 rue de la Paix');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.locator('input[name="postalCode"]').fill('75001', { force: true });
    await page.locator('input[name="city"]').fill('Paris', { force: true });

    await selectClickCollect(page);
    await selectFirstPickupPoint(page);

    // Déclenche le paiement (bouton de la dernière étape).
    // À CONFIRMER À L'IMPLÉMENTATION : libellé exact du bouton de paiement.
    const payBtn = page.getByRole('button', { name: /payer|passer au paiement|régler/i }).last();
    await expect(payBtn).toBeEnabled({ timeout: 10_000 });
    await payBtn.click();

    // Attend que l'interception ait capturé le payload.
    await expect.poll(() => capturedBody, { timeout: 15_000 }).not.toBeNull();

    const body = capturedBody as {
      shippingMethod?: string;
      shippingCountry?: string;
      pickupPoint?: { id?: string; provider?: string } | null;
    };
    expect(body.shippingMethod).toBe('click_collect');
    expect(body.shippingCountry).toBe('FR');
    expect(body.pickupPoint).toBeTruthy();
    expect(body.pickupPoint?.id).toBeTruthy();
    // provider posé côté client (union discriminée PR2/PR3).
    // Si absent du payload -> manque PR3 (ClickCollectPicker doit poser provider:'click_collect').
    expect(body.pickupPoint?.provider).toBe('click_collect');
  });
});
```

- [ ] **Step 2 — Lancer l'E2E → échec attendu.** Commande : `npm run test:e2e -- click-collect.spec.ts`. Sortie attendue : échec sur `selectClickCollect` (`ccOption` introuvable) tant que les sélecteurs réels de PR3 ne sont pas confirmés. **Action : Grep le composant réel** (`lolett-app/features/checkout/components/ShippingMethodSelect.tsx` après modif PR3, + le nouveau `ClickCollectPicker`) et ajuster `selectClickCollect`/`selectFirstPickupPoint`/`payBtn` aux libellés/rôles réels. Re-lancer.
- [ ] **Step 3 — Vérification manuelle concrète (E2E navigateur).** Lancer `npm run dev`, ouvrir `http://localhost:3000/checkout` avec un produit FR au panier : l'option « Retrait en boutique » est visible, la cliquer affiche la liste des points, en choisir un, le bouton de paiement s'active. Confirmer que le réseau (onglet Network) montre bien `shippingMethod:"click_collect"` + `pickupPoint.provider:"click_collect"` dans le POST `/api/checkout/stripe`.
- [ ] **Step 4 — Relancer l'E2E → succès.** `npm run test:e2e -- click-collect.spec.ts`. Sortie attendue : `1 passed`.
- [ ] **Step 5 — Type-check.** `npm run type-check`. Sortie attendue : aucune erreur (le `tsconfig.json` inclut `**/*.ts`, donc `e2e/*.spec.ts` est bien typechecké).
- [ ] **Step 6 — Commit.** `git add lolett-app/e2e/click-collect.spec.ts` puis `git commit -m "test(e2e): parcours Click & Collect jusqu'à la redirection Stripe (§12.4.1)"`.

---

### Task 2: E2E — bascule Mondial Relay → Click & Collect (spec §12.4.2)

**Files:**
- Modify: `lolett-app/e2e/click-collect.spec.ts` (ajouter un `test.describe`)

**Objectif :** prouver que passer de `mondial_relay` (avec un point MR sélectionné) à `click_collect` **réinitialise `pickupPoint`** (pas de résidu MR persisté). Le store réel (`features/cart/store.ts` L118-121) ne reset `pickupPoint` que si `method === 'home'` — donc une bascule MR→C&C **ne reset PAS** aujourd'hui. PR2 doit étendre `setShippingMethod` pour reset à tout changement de méthode (spec §5.5), ou l'UI de PR3 doit reset le point au changement. **Ce test pilote ce comportement** : si le point MR reste collé, le test échoue et signale le manque PR2/PR3.

- [ ] **Step 1 — Écrire le test qui échoue.** Ajouter dans `lolett-app/e2e/click-collect.spec.ts`, à l'intérieur d'un nouveau bloc :

```ts
test.describe('Click & Collect — bascules de méthode', () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }) => {
    await dismissCookieConsent(page);
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('lolett-cart'));
    await addFirstProductToCart(page);
  });

  test('MR -> C&C reset le pickupPoint (aucun résidu Mondial Relay)', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // 1. Sélectionner Mondial Relay puis FORCER un point MR dans le store
    // (le widget MR Leaflet n'est pas pilotable de façon fiable en E2E ;
    // on injecte l'état comme le ferait OnParcelShopSelected, cf. MondialRelayWidget).
    // À CONFIRMER : le label exact de l'option MR (SHIPPING_METHODS.mondial_relay.label =
    // "Point Relais Mondial Relay").
    const mrOption = page.getByRole('radio', { name: /mondial relay|point relais/i })
      .or(page.getByRole('button', { name: /mondial relay|point relais/i }));
    await expect(mrOption.first()).toBeVisible({ timeout: 10_000 });
    await mrOption.first().click();

    await page.evaluate(() => {
      const raw = localStorage.getItem('lolett-cart');
      const parsed = raw ? JSON.parse(raw) : { state: {}, version: 3 };
      parsed.state = parsed.state || {};
      parsed.state.shippingMethod = 'mondial_relay';
      parsed.state.pickupPoint = {
        id: 'MR-12345',
        provider: 'mondial_relay',
        name: 'Relais Tabac du Coin',
        address: '5 rue Test',
        postalCode: '75002',
        city: 'Paris',
        country: 'FR',
      };
      localStorage.setItem('lolett-cart', JSON.stringify(parsed));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 2. Basculer sur Click & Collect.
    await selectClickCollect(page);

    // 3. Vérifier que le point MR a disparu du store (reset attendu).
    const pickupAfter = await page.evaluate(() => {
      const raw = localStorage.getItem('lolett-cart');
      const parsed = raw ? JSON.parse(raw) : { state: {} };
      return {
        method: parsed.state?.shippingMethod ?? null,
        point: parsed.state?.pickupPoint ?? null,
      };
    });

    expect(pickupAfter.method).toBe('click_collect');
    // Soit point null (reset franc), soit un point dont le provider est click_collect —
    // dans tous les cas, AUCUN résidu provider 'mondial_relay'.
    if (pickupAfter.point) {
      expect((pickupAfter.point as { provider?: string }).provider).not.toBe('mondial_relay');
      expect((pickupAfter.point as { id?: string }).id).not.toBe('MR-12345');
    }
  });
});
```

- [ ] **Step 2 — Lancer → échec attendu.** `npm run test:e2e -- click-collect.spec.ts -g "MR -> C&C"`. Échec attendu si le store conserve le point MR après bascule (résidu) ou si le sélecteur C&C diffère. **Action :** confirmer les sélecteurs, et si le résidu persiste, c'est un manque PR2/PR3 (le store doit reset `pickupPoint` au changement de méthode, cf. spec §5.5). Remonter ; ne pas patcher le test.
- [ ] **Step 3 — Vérification manuelle concrète.** En `npm run dev` : choisir MR, sélectionner un point relais via le widget, puis cliquer « Retrait en boutique » → la liste C&C s'affiche sans aucun encart « point relais sélectionné » résiduel ; le récap ne montre plus l'adresse MR.
- [ ] **Step 4 — Relancer → succès.** `npm run test:e2e -- click-collect.spec.ts -g "MR -> C&C"`. Sortie attendue : `1 passed`.
- [ ] **Step 5 — Type-check.** `npm run type-check`. Aucune erreur attendue.
- [ ] **Step 6 — Commit.** `git add lolett-app/e2e/click-collect.spec.ts` puis `git commit -m "test(e2e): bascule Mondial Relay → Click & Collect reset le point (§12.4.2)"`.

---

### Task 3: E2E — bascule FR → BE force `home` quand C&C sélectionné (spec §12.4.3)

**Files:**
- Modify: `lolett-app/e2e/click-collect.spec.ts` (même bloc `bascules de méthode`)

**Objectif :** prouver que si C&C est sélectionné (FR) et que la cliente passe le pays à BE, le store rebascule sur `home` et vide `pickupPoint` — comportement déjà présent dans `setShippingCountry` (`features/cart/store.ts` L117 : `set({ shippingCountry, shippingMethod: 'home', pickupPoint: null })`). Ce test verrouille cette garantie côté UI (et que l'option C&C disparaît du sélecteur en BE, cf. `restrictTo:['FR']` spec §6.1).

- [ ] **Step 1 — Écrire le test qui échoue.** Ajouter dans le bloc `bascules de méthode` :

```ts
  test('FR (C&C) -> BE force shippingMethod=home et vide le point', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // 1. Sélectionner Click & Collect en FR + un point.
    await selectClickCollect(page);
    await selectFirstPickupPoint(page);

    const before = await page.evaluate(() => {
      const raw = localStorage.getItem('lolett-cart');
      const parsed = raw ? JSON.parse(raw) : { state: {} };
      return parsed.state?.shippingMethod ?? null;
    });
    expect(before).toBe('click_collect');

    // 2. Changer le pays vers BE.
    // À CONFIRMER À L'IMPLÉMENTATION : le sélecteur de pays (composant CountrySelect du checkout).
    // Le pattern actuel est un <select name="...country..."> ou un combobox.
    const countrySelect = page.locator('select[name*="country" i], [role="combobox"][aria-label*="pays" i]').first();
    await expect(countrySelect).toBeVisible({ timeout: 10_000 });
    // selectOption fonctionne pour un <select> natif ; pour un combobox custom, adapter (Grep PR3).
    await countrySelect.selectOption('BE').catch(async () => {
      // Fallback combobox custom : ouvrir + cliquer l'option Belgique.
      await countrySelect.click();
      await page.getByRole('option', { name: /belgique/i }).click();
    });
    await page.waitForTimeout(500);

    // 3. Le store doit être repassé sur home + point vidé.
    const after = await page.evaluate(() => {
      const raw = localStorage.getItem('lolett-cart');
      const parsed = raw ? JSON.parse(raw) : { state: {} };
      return {
        country: parsed.state?.shippingCountry ?? null,
        method: parsed.state?.shippingMethod ?? null,
        point: parsed.state?.pickupPoint ?? null,
      };
    });
    expect(after.country).toBe('BE');
    expect(after.method).toBe('home');
    expect(after.point).toBeNull();

    // 4. L'option C&C ne doit plus être proposée en BE.
    const ccOption = page.getByRole('radio', { name: /retrait en boutique|click ?& ?collect/i })
      .or(page.getByRole('button', { name: /retrait en boutique|click ?& ?collect/i }));
    await expect(ccOption).toHaveCount(0);
  });
```

- [ ] **Step 2 — Lancer → échec attendu.** `npm run test:e2e -- click-collect.spec.ts -g "FR (C&C) -> BE"`. Échec attendu tant que les sélecteurs réels (pays + option C&C) ne sont pas confirmés. **Action :** Grep le composant pays du checkout (probablement sous `lolett-app/features/checkout/components/`) et ajuster le sélecteur.
- [ ] **Step 3 — Vérification manuelle concrète.** En `npm run dev` : sélectionner C&C + un point en FR, puis changer le pays en Belgique → la méthode repasse visuellement sur « Livraison à domicile », l'option « Retrait en boutique » disparaît, aucun point n'est affiché.
- [ ] **Step 4 — Relancer → succès.** `npm run test:e2e -- click-collect.spec.ts -g "FR (C&C) -> BE"`. Sortie attendue : `1 passed`.
- [ ] **Step 5 — Type-check.** `npm run type-check`. Aucune erreur attendue.
- [ ] **Step 6 — Commit.** `git add lolett-app/e2e/click-collect.spec.ts` puis `git commit -m "test(e2e): bascule FR→BE force home quand C&C sélectionné (§12.4.3)"`.

---

### Task 4: Cas limite — webhook session C&C avec pickup_point invalide → `payment_review` (spec §13 A10)

**Files:**
- Create: `lolett-app/__tests__/api/webhook-click-collect.test.ts`
- (Sujet) `lolett-app/app/api/webhooks/stripe/route.ts` (handler `POST`)

**Objectif :** renforcer/compléter la couverture PR5. On appelle le handler `POST` du webhook avec un event `checkout.session.completed` dont la metadata indique `click_collect` + un `pickupPoint` **invalide** (point inconnu en DB, OU `is_active=false`, OU provider invalide). Comportement attendu (implémenté en PR5, cf. Note de cadrage 11) : la commande est créée (snapshot `pickup_point` stocké) puis, AVANT mark-paid, basculée en `status='payment_review'`, `Sentry.captureMessage` avec `tags.feature='click_and_collect'` + `tags.step='webhook'`, **aucun `sendOrderConfirmation`**, **aucun `sendNewOrderAlertToAdmin`**.

**Mocking (cf. Note de cadrage 10) :** on mocke (a) `stripe` (constructEvent renvoie l'event tel quel), (b) `@/lib/supabase/admin` (`createAdminClient` : `stripe_webhook_events` insert+update pour idempotence/markEventProcessed, `orders` select existant + update `payment_review`, `pickup_points` select `.eq().maybeSingle()`), (c) `@/lib/adapters/supabase` (`SupabaseOrderRepository.create` → renvoie un order minimal SANS toucher la DB), (d) `@/lib/orders/decrement-stock`, (e) `@/lib/invoice/generate-invoice`, (f) `@/lib/email/order-confirmation`, (g) `@/lib/email/order-new-admin`, (h) `@sentry/nextjs`, (i) `next/server` (`after` inline). Pattern `vi.hoisted` + `vi.mock` AVANT import du handler (cf. `order-cancelled.test.ts` / `newsletter-subscribe.test.ts`).

- [ ] **Step 1 — Écrire le test qui échoue.** Créer `lolett-app/__tests__/api/webhook-click-collect.test.ts` :

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  constructEventMock,
  orderCreateMock,
  decrementStockMock,
  generateInvoiceMock,
  sendOrderConfirmationMock,
  sendNewOrderAlertMock,
  captureMessageMock,
  // builder de client admin : on injecte un comportement par table.
  fromMock,
} = vi.hoisted(() => ({
  constructEventMock: vi.fn(),
  orderCreateMock: vi.fn(),
  decrementStockMock: vi.fn().mockResolvedValue(undefined),
  generateInvoiceMock: vi.fn().mockResolvedValue({ pdf: null, number: 'F-1' }),
  sendOrderConfirmationMock: vi.fn().mockResolvedValue({ success: true }),
  sendNewOrderAlertMock: vi.fn().mockResolvedValue({ success: true }),
  captureMessageMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    webhooks: { constructEvent: constructEventMock },
  })),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: fromMock }),
}));

// SupabaseOrderRepository.create() instancie son PROPRE createAdminClient interne
// et fait orders.insert + order_items.insert. On le mocke pour qu'il renvoie un
// order minimal sans toucher la DB (cf. Note de cadrage 10).
vi.mock('@/lib/adapters/supabase', () => ({
  SupabaseOrderRepository: vi.fn().mockImplementation(() => ({
    create: orderCreateMock,
  })),
}));

vi.mock('@/lib/orders/decrement-stock', () => ({
  decrementStockForOrder: decrementStockMock,
}));
vi.mock('@/lib/invoice/generate-invoice', () => ({
  generateInvoicePdf: generateInvoiceMock,
}));
vi.mock('@/lib/email/order-confirmation', () => ({
  sendOrderConfirmation: sendOrderConfirmationMock,
}));
vi.mock('@/lib/email/order-new-admin', () => ({
  sendNewOrderAlertToAdmin: sendNewOrderAlertMock,
}));
vi.mock('@sentry/nextjs', () => ({
  captureMessage: captureMessageMock,
  captureException: vi.fn(),
}));
// after() de next/server : exécute la callback immédiatement en test. On spread
// l'original pour préserver NextResponse (utilisé par le handler).
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return { ...actual, after: (cb: () => unknown) => { void cb(); } };
});

// Import APRÈS les mocks.
import { POST } from '@/app/api/webhooks/stripe/route';

const CUSTOMER = {
  firstName: 'Marie', lastName: 'Dupont', email: 'marie.cc@test.com',
  phone: '0612345678', address: '12 rue de la Paix', city: 'Paris',
  postalCode: '75001', country: 'FR',
};
const ITEMS = [{ productId: 'p1', productName: 'Robe', size: 'M', quantity: 1, price: 49 }];

// buildEvent fournit À LA FOIS les clés camelCase (lues aujourd'hui par le webhook,
// route.ts L235-247) ET les clés plates snake_case (D5, lues par la revalidation PR5)
// pour ne pas présupposer le choix final de PR5. Le snapshot pickupPoint reste
// camelCase (postalCode). cf. Note de cadrage 7 (D5).
function buildEvent(pickupPoint: { id: string; provider: string; [k: string]: unknown }) {
  return {
    id: `evt_${Math.random().toString(36).slice(2)}`,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_1',
        payment_intent: `pi_${Math.random().toString(36).slice(2)}`,
        metadata: {
          items: JSON.stringify(ITEMS),
          customer: JSON.stringify(CUSTOMER),
          total: '49',
          shipping: '0',
          // camelCase (existant)
          shippingMethod: 'click_collect',
          shippingCountry: 'FR',
          pickupPoint: JSON.stringify(pickupPoint),
          // snake_case plat (D5)
          shipping_method: 'click_collect',
          shipping_country: 'FR',
          pickup_point_id: pickupPoint.id,
          pickup_provider: pickupPoint.provider,
          userId: '',
        },
      },
    },
  };
}

// Construit un client admin mocké couvrant TOUTES les tables réellement touchées :
//  - stripe_webhook_events : insert (idempotence) + update (markEventProcessed)
//  - orders : select existant (.eq().maybeSingle() -> null) + update (capture payment_review)
//  - pickup_points : select .eq().maybeSingle() -> opts.point (D3)
//  - autres : no-op chainable défensif.
function makeAdmin(opts: {
  point: { id: string; is_active: boolean } | null;
  capturedUpdates: Array<Record<string, unknown>>;
}) {
  return (table: string) => {
    if (table === 'stripe_webhook_events') {
      return {
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        delete: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      };
    }
    if (table === 'pickup_points') {
      return {
        select: () => ({
          eq: () => ({
            // chaîne 2e .eq éventuelle (is_active) tolérée par D3 (le check is_active
            // peut être fait en JS après maybeSingle, ou via un 2e .eq) :
            eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: opts.point, error: null }) }),
            maybeSingle: vi.fn().mockResolvedValue({ data: opts.point, error: null }),
          }),
        }),
      };
    }
    if (table === 'orders') {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }),
        }),
        update: (payload: Record<string, unknown>) => {
          opts.capturedUpdates.push(payload);
          return { eq: vi.fn().mockResolvedValue({ error: null }) };
        },
      };
    }
    // autres tables (cart_items, promo_codes, gift_cards, loyalty rpc...) : no-op chainable.
    return {
      insert: vi.fn().mockResolvedValue({ error: null }),
      delete: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      select: () => ({ eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
      update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    };
  };
}

function makeRequest(event: unknown) {
  // Le handler lit req.text() puis constructEvent — on renvoie l'event via le mock.
  constructEventMock.mockReturnValue(event);
  return new Request('http://x/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'stripe-signature': 'sig_test' },
    body: JSON.stringify(event),
  });
}

describe('POST /api/webhooks/stripe — Click & Collect pickup_point invalide', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_x';
    constructEventMock.mockReset();
    fromMock.mockReset();
    // create() renvoie un order minimal (orderNumber + id) sans DB.
    orderCreateMock.mockReset();
    orderCreateMock.mockResolvedValue({ id: 'order-1', orderNumber: 'LOL-CC-1' });
    decrementStockMock.mockClear();
    generateInvoiceMock.mockClear();
    sendOrderConfirmationMock.mockClear();
    sendNewOrderAlertMock.mockClear();
    captureMessageMock.mockClear();
  });

  it('point inconnu en DB -> order en payment_review, aucun email confirmation, Sentry alerté', async () => {
    const capturedUpdates: Array<Record<string, unknown>> = [];
    fromMock.mockImplementation(makeAdmin({ point: null, capturedUpdates }));

    const event = buildEvent({ id: 'unknown-id', provider: 'click_collect', name: 'X', address: 'Y', postalCode: '75001', city: 'Paris', country: 'FR' });
    const res = await POST(makeRequest(event) as unknown as import('next/server').NextRequest);

    expect(res.status).toBe(200);
    expect(capturedUpdates.some((u) => u.status === 'payment_review')).toBe(true);
    expect(sendOrderConfirmationMock).not.toHaveBeenCalled();
    expect(sendNewOrderAlertMock).not.toHaveBeenCalled();
    expect(captureMessageMock).toHaveBeenCalled();
    const sentryArgs = captureMessageMock.mock.calls[0][1] as { tags?: Record<string, string> };
    expect(sentryArgs.tags?.feature).toBe('click_and_collect');
    expect(sentryArgs.tags?.step).toBe('webhook');
  });

  it('point désactivé (is_active=false) -> order en payment_review, aucun email confirmation', async () => {
    const capturedUpdates: Array<Record<string, unknown>> = [];
    fromMock.mockImplementation(makeAdmin({ point: { id: 'pt-1', is_active: false }, capturedUpdates }));

    const event = buildEvent({ id: 'pt-1', provider: 'click_collect', name: 'Boutique', address: 'Y', postalCode: '75001', city: 'Paris', country: 'FR' });
    const res = await POST(makeRequest(event) as unknown as import('next/server').NextRequest);

    expect(res.status).toBe(200);
    expect(capturedUpdates.some((u) => u.status === 'payment_review')).toBe(true);
    expect(sendOrderConfirmationMock).not.toHaveBeenCalled();
  });

  it('provider invalide (mondial_relay sur méthode click_collect) -> payment_review', async () => {
    const capturedUpdates: Array<Record<string, unknown>> = [];
    fromMock.mockImplementation(makeAdmin({ point: { id: 'pt-1', is_active: true }, capturedUpdates }));

    const event = buildEvent({ id: 'pt-1', provider: 'mondial_relay', name: 'Relais', address: 'Y', postalCode: '75001', city: 'Paris', country: 'FR' });
    const res = await POST(makeRequest(event) as unknown as import('next/server').NextRequest);

    expect(res.status).toBe(200);
    expect(capturedUpdates.some((u) => u.status === 'payment_review')).toBe(true);
    expect(sendOrderConfirmationMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2 — Lancer → échec attendu.** `npm run test -- webhook-click-collect`. Sortie attendue : échecs (`expected payment_review to be in capturedUpdates` / `sendOrderConfirmation called`) si PR5 n'a pas branché la revalidation C&C dans le webhook. **Si échec :** vérifier que PR5 revalide `pickup_points` en DB (`.maybeSingle()`, D3) pour `shippingMethod==='click_collect'`, AVANT mark-paid (Note de cadrage 11), et bascule `payment_review` + return précoce (skip email). C'est le contrat A10 ; remonter à PR5 si manquant.
- [ ] **Step 3 — Adapter les chaînes mockées au handler réel (si nécessaire).** Le handler webhook appelle plusieurs `.from(...)` ; vérifier par Grep l'ordre/colonnes exacts lus en PR5 (notamment le `select` sur `pickup_points` : `.eq('id', ...).maybeSingle()` ou `.eq('id', ...).eq('is_active', true).maybeSingle()`) et confirmer que `makeAdmin` couvre la séquence. **Si le handler PR5 utilise `.single()` au lieu de `.maybeSingle()`, c'est une violation de D3 → remonter à PR5, ne pas adapter le mock.** Re-lancer.
- [ ] **Step 4 — Relancer → succès.** `npm run test -- webhook-click-collect`. Sortie attendue : `3 passed`.
- [ ] **Step 5 — Type-check.** `npm run type-check`. Aucune erreur attendue.
- [ ] **Step 6 — Commit.** `git add lolett-app/__tests__/api/webhook-click-collect.test.ts` puis `git commit -m "test(api): webhook C&C pickup_point invalide → payment_review (§13 A10)"`.

---

### Task 5: Cas limite — transitions admin `ready_for_pickup` / `picked_up` (spec §13 A3, A4)

**Files:**
- Create: `lolett-app/__tests__/api/admin-orders-pickup.test.ts`
- (Sujet) `lolett-app/app/api/admin/orders/[id]/route.ts` (handler `PATCH`, étendu par **PR4** — D4)

**Objectif :** vérifier que le `PATCH` admin (étendu en **PR4** — D4) :
- A3 : `confirmed → ready_for_pickup` (ou `paid → ready_for_pickup`) pose `ready_for_pickup_at`, génère/assigne `pickup_code` (`assignPickupCodeAtomic`), et déclenche l'email `sendOrderReadyForPickupEmail` (mock, D1).
- A4 : `ready_for_pickup → picked_up` pose `picked_up_at` et **n'envoie AUCUN email**.
- Transition non autorisée (`pending → picked_up`) → 400 (Note de cadrage 6 : avant l'extension PR4 c'est Zod qui rejette ; après, c'est `ORDER_STATUS_TRANSITIONS`).

On mocke `checkAdminCookieFromRequest` (→ true), `createAdminClient`, le sender `sendOrderReadyForPickupEmail` (export EXACT, PR3, branché par PR4 — D1/D12), et les autres senders (`sendOrderShipped`, `sendOrderDelivered`, `sendOrderCancelled`) pour vérifier qu'ils ne partent pas. `next/server.after` exécuté inline.

- [ ] **Step 1 — Écrire le test qui échoue.** Créer `lolett-app/__tests__/api/admin-orders-pickup.test.ts` :

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  checkAdminMock,
  fromMock,
  sendReadyMock,
  sendShippedMock,
  sendDeliveredMock,
  sendCancelledMock,
} = vi.hoisted(() => ({
  checkAdminMock: vi.fn().mockResolvedValue(true),
  fromMock: vi.fn(),
  // D1 : le sender renvoie Promise<void> -> on résout undefined (pas {success:true}).
  sendReadyMock: vi.fn().mockResolvedValue(undefined),
  sendShippedMock: vi.fn().mockResolvedValue({ success: true }),
  sendDeliveredMock: vi.fn().mockResolvedValue({ success: true }),
  sendCancelledMock: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/admin/auth', () => ({ checkAdminCookieFromRequest: checkAdminMock }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: fromMock }) }));
// Sender C&C (PR3) — export EXACT sendOrderReadyForPickupEmail (D1/D12).
// Chemin : lib/email/order-ready-for-pickup.ts.
vi.mock('@/lib/email/order-ready-for-pickup', () => ({ sendOrderReadyForPickupEmail: sendReadyMock }));
vi.mock('@/lib/email/order-shipped', () => ({ sendOrderShipped: sendShippedMock }));
vi.mock('@/lib/email/order-delivered', () => ({ sendOrderDelivered: sendDeliveredMock }));
vi.mock('@/lib/email/order-cancelled', () => ({ sendOrderCancelled: sendCancelledMock }));
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return { ...actual, after: (cb: () => unknown) => { void cb(); } };
});

import { PATCH } from '@/app/api/admin/orders/[id]/route';

// Client admin mocké : .from('orders').select(...).eq(...).single() renvoie la commande
// courante ; .update(payload).eq(...).select(...).single() capture le payload et renvoie la
// commande mise à jour. order_items renvoie [].
// NB : assignPickupCodeAtomic (PR3) fait update({...}).eq('id').is('pickup_code', null).select().single()
// -> la chaîne update tolère .eq().is().select().single() ET .eq().select().single().
function makeAdmin(opts: {
  current: Record<string, unknown>;
  captured: Array<Record<string, unknown>>;
}) {
  return (table: string) => {
    if (table === 'orders') {
      const updateChain = (payload: Record<string, unknown>) => {
        opts.captured.push(payload);
        const single = vi.fn().mockResolvedValue({ data: { ...opts.current, ...payload }, error: null });
        const selectObj = { single, maybeSingle: single };
        const afterEq = {
          select: () => selectObj,
          is: () => ({ select: () => selectObj }),
        };
        return { eq: () => afterEq };
      };
      return {
        select: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValue({ data: opts.current, error: null }),
            maybeSingle: vi.fn().mockResolvedValue({ data: opts.current, error: null }),
          }),
        }),
        update: updateChain,
      };
    }
    if (table === 'order_items') {
      return { select: () => ({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) };
    }
    return { select: () => ({ eq: () => ({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }) };
  };
}

function patchReq(body: unknown) {
  return new Request('http://x/api/admin/orders/order-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
const PARAMS = { params: Promise.resolve({ id: 'order-1' }) };

describe('PATCH /api/admin/orders/[id] — transitions Click & Collect (PR4)', () => {
  beforeEach(() => {
    checkAdminMock.mockResolvedValue(true);
    sendReadyMock.mockClear();
    sendShippedMock.mockClear();
    sendDeliveredMock.mockClear();
    sendCancelledMock.mockClear();
    fromMock.mockReset();
  });

  it('A3 : confirmed -> ready_for_pickup pose ready_for_pickup_at + pickup_code et envoie l\'email', async () => {
    const captured: Array<Record<string, unknown>> = [];
    fromMock.mockImplementation(makeAdmin({
      current: {
        id: 'order-1', status: 'confirmed', order_number: 'LOL-CC-1',
        customer: { firstName: 'Marie', email: 'marie.cc@test.com' },
        shipping_method: 'click_collect',
        pickup_point: { id: 'pt-1', provider: 'click_collect', name: 'Boutique du Marais' },
        pickup_code: null, payment_provider: 'stripe',
      },
      captured,
    }));

    const res = await PATCH(patchReq({ status: 'ready_for_pickup' }), PARAMS);
    expect(res.status).toBe(200);

    const upd = captured.find((u) => u.status === 'ready_for_pickup');
    expect(upd).toBeTruthy();
    expect(upd?.ready_for_pickup_at).toBeTruthy();
    expect(typeof upd?.pickup_code).toBe('string');
    expect(String(upd?.pickup_code)).toMatch(/^LOL-[A-Z2-9]{5}$/);
    expect(sendReadyMock).toHaveBeenCalledTimes(1);
    const emailArg = sendReadyMock.mock.calls[0][0] as {
      pickupCode?: string; orderNumber?: string; pickupPoint?: { provider?: string } | null;
    };
    expect(emailArg.orderNumber).toBe('LOL-CC-1');
    expect(emailArg.pickupCode).toBe(String(upd?.pickup_code));
    // D1 : le sender reçoit pickupPoint: PickupPoint | null (ici provider click_collect).
    expect(emailArg.pickupPoint?.provider).toBe('click_collect');
  });

  it('A4 : ready_for_pickup -> picked_up pose picked_up_at et n\'envoie AUCUN email', async () => {
    const captured: Array<Record<string, unknown>> = [];
    fromMock.mockImplementation(makeAdmin({
      current: {
        id: 'order-1', status: 'ready_for_pickup', order_number: 'LOL-CC-1',
        customer: { firstName: 'Marie', email: 'marie.cc@test.com' },
        shipping_method: 'click_collect',
        pickup_point: { id: 'pt-1', provider: 'click_collect', name: 'Boutique' },
        pickup_code: 'LOL-A7K2X', payment_provider: 'stripe',
      },
      captured,
    }));

    const res = await PATCH(patchReq({ status: 'picked_up' }), PARAMS);
    expect(res.status).toBe(200);

    const upd = captured.find((u) => u.status === 'picked_up');
    expect(upd).toBeTruthy();
    expect(upd?.picked_up_at).toBeTruthy();
    expect(sendReadyMock).not.toHaveBeenCalled();
    expect(sendShippedMock).not.toHaveBeenCalled();
    expect(sendDeliveredMock).not.toHaveBeenCalled();
    expect(sendCancelledMock).not.toHaveBeenCalled();
  });

  it('transition non autorisée pending -> picked_up renvoie 400', async () => {
    const captured: Array<Record<string, unknown>> = [];
    fromMock.mockImplementation(makeAdmin({
      current: { id: 'order-1', status: 'pending', order_number: 'LOL-CC-1', payment_provider: 'stripe' },
      captured,
    }));

    const res = await PATCH(patchReq({ status: 'picked_up' }), PARAMS);
    expect(res.status).toBe(400);
    expect(captured.find((u) => u.status === 'picked_up')).toBeUndefined();
  });
});
```

- [ ] **Step 2 — Lancer → échec attendu.** `npm run test -- admin-orders-pickup`. Sortie attendue : échecs si **PR4** (D4) n'a pas (a) ajouté `ready_for_pickup`/`picked_up` à `ORDER_STATUSES`/`PatchSchema` (ou consommé `ORDER_STATUS_VALUES`), (b) l'auto-set `ready_for_pickup_at`/`picked_up_at`, (c) l'appel `assignPickupCodeAtomic` (génération `pickup_code`), (d) le branchement email `sendOrderReadyForPickupEmail` (export EXACT, D1). **Si échec :** remonter à **PR4** (contrats A3/A4, D4). Confirmer aussi le **chemin réel** du sender (`lib/email/order-ready-for-pickup.ts`, créé par PR3) et la **forme du payload** email (clés `to`, `firstName`, `orderNumber`, `pickupCode`, `pickupPoint`, cf. spec §8.2 L646-652) par Grep, puis aligner les assertions si la forme diffère.
- [ ] **Step 3 — Aligner la chaîne admin mockée sur le handler réel.** Le `PATCH` réel fait `select('*')...single()` (L92-96) puis, pour C&C, l'update transite par `assignPickupCodeAtomic` (`update({...}).eq('id').is('pickup_code', null).select().single()`, spec §8.1) tandis que les transitions non-C&C font `update(...).eq('id').select().single()` (L138-143). Vérifier que `makeAdmin` couvre les deux chaînes (`.eq().is().select().single()` ET `.eq().select().single()`). Re-lancer.
- [ ] **Step 4 — Relancer → succès.** `npm run test -- admin-orders-pickup`. Sortie attendue : `3 passed`.
- [ ] **Step 5 — Type-check.** `npm run type-check`. Aucune erreur attendue.
- [ ] **Step 6 — Commit.** `git add lolett-app/__tests__/api/admin-orders-pickup.test.ts` puis `git commit -m "test(api): transitions admin ready_for_pickup/picked_up + email/code (§13 A3,A4)"`.

---

### Task 6: Cas limite — refund d'une commande `ready_for_pickup` (spec §13 A9)

**Files:**
- Create: `lolett-app/__tests__/api/refund-click-collect.test.ts`
- (Sujet) `lolett-app/app/api/admin/orders/[id]/refund/route.ts` (handler `POST`)

**Objectif :** prouver que la route refund (après recâblage **PR4** de `REFUNDABLE_STATUSES` sur `@/lib/constants`, qui inclut `ready_for_pickup` — D2) accepte un refund Stripe sur une commande C&C `ready_for_pickup` (cliente no-show), et qu'inversement elle refuse un statut non remboursable (`pending`). On mocke `checkAdminCookieFromRequest`, `createAdminClient`, `Stripe` (le constructeur via `default`, qui couvre `getStripe()` = `new Stripe(...)`, exposant `refunds.create`), et `getAlreadyRefundedQtyMap` (→ Map vide) pour le mode `commercial_gesture` (qui n'appelle pas `order_items`).

- [ ] **Step 1 — Écrire le test qui échoue.** Créer `lolett-app/__tests__/api/refund-click-collect.test.ts` :

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  checkAdminMock,
  fromMock,
  refundsCreateMock,
} = vi.hoisted(() => ({
  checkAdminMock: vi.fn().mockResolvedValue(true),
  fromMock: vi.fn(),
  refundsCreateMock: vi.fn().mockResolvedValue({ id: 're_test_1', amount: 4900 }),
}));

vi.mock('@/lib/admin/auth', () => ({ checkAdminCookieFromRequest: checkAdminMock }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: fromMock }) }));
// getStripe() = new Stripe(...) -> on mocke le constructeur default.
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    refunds: { create: refundsCreateMock },
  })),
}));
// getAlreadyRefundedQtyMap appelle stripe.refunds.list ; pour le mode commercial_gesture
// il n'est pas appelé, mais on le neutralise par sécurité.
vi.mock('@/lib/orders/refund-tracking', () => ({
  getAlreadyRefundedQtyMap: vi.fn().mockResolvedValue(new Map()),
  refundItemKey: (p: string, s: string, c: string | null) => `${p}|${s}|${c ?? ''}`,
}));

import { POST } from '@/app/api/admin/orders/[id]/refund/route';

// orders.select(...).eq(...).single() -> commande ;
// orders.update(...).eq(...)[.eq/.is](...).select('id') -> réservation préemptive OK.
function makeAdmin(order: Record<string, unknown>) {
  return (table: string) => {
    if (table === 'orders') {
      const updateChain = (payload: Record<string, unknown>) => {
        void payload;
        const tail = { select: vi.fn().mockResolvedValue({ data: [{ id: order.id }], error: null }) };
        return {
          eq: () => ({
            eq: () => tail,
            is: () => tail,
            select: tail.select,
          }),
        };
      };
      return {
        select: () => ({ eq: () => ({ single: vi.fn().mockResolvedValue({ data: order, error: null }) }) }),
        update: updateChain,
      };
    }
    return { select: () => ({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) };
  };
}

function refundReq(body: unknown) {
  return new Request('http://x/api/admin/orders/order-1/refund', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
const PARAMS = { params: Promise.resolve({ id: 'order-1' }) };

describe('POST /api/admin/orders/[id]/refund — Click & Collect', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    checkAdminMock.mockResolvedValue(true);
    refundsCreateMock.mockClear();
    fromMock.mockReset();
  });

  it('A9 : commande ready_for_pickup (no-show) -> refund commercial_gesture accepté', async () => {
    fromMock.mockImplementation(makeAdmin({
      id: 'order-1', payment_id: 'pi_test_1', payment_provider: 'stripe',
      total: 49, status: 'ready_for_pickup', refund_amount: 0,
    }));

    const res = await POST(refundReq({
      kind: 'commercial_gesture',
      amount: 49,
      reason: 'Cliente non venue retirer — remboursement',
      nonce: 'nonce-abc-123',
    }), PARAMS);

    expect(res.status).toBe(200);
    expect(refundsCreateMock).toHaveBeenCalledTimes(1);
    const stripeArgs = refundsCreateMock.mock.calls[0][0] as { payment_intent?: string; amount?: number };
    expect(stripeArgs.payment_intent).toBe('pi_test_1');
    expect(stripeArgs.amount).toBe(4900);
  });

  it('refuse un statut non remboursable (pending) avec 400', async () => {
    fromMock.mockImplementation(makeAdmin({
      id: 'order-1', payment_id: 'pi_test_1', payment_provider: 'stripe',
      total: 49, status: 'pending', refund_amount: 0,
    }));

    const res = await POST(refundReq({
      kind: 'commercial_gesture', amount: 10, reason: 'test', nonce: 'nonce-xyz-987',
    }), PARAMS);

    expect(res.status).toBe(400);
    expect(refundsCreateMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2 — Lancer → échec attendu.** `npm run test -- refund-click-collect`. Sortie attendue : le 1er test échoue avec 400 (`Impossible de rembourser une commande en statut "ready_for_pickup"`) si **PR4** n'a pas recâblé `REFUNDABLE_STATUSES` (route L36 + `RefundDialog.tsx`) sur `@/lib/constants` (qui inclut `ready_for_pickup`). **Si échec :** remonter à **PR4** — c'est exactement le contrat A9 (D2). Ne pas patcher la route depuis PR6.
- [ ] **Step 3 — Aligner la chaîne `update` mockée sur la vraie réservation préemptive.** La route fait `update({refund_amount}).eq('id', orderId)` puis `.eq('refund_amount', prev)` OU `.is('refund_amount', null)` selon que `prev` est numérique ou null, puis `.select('id')` (route L224-232). Le mock `makeAdmin` couvre les deux branches via `eq().eq()/is()` et le `tail.select`. Vérifier qu'aucune autre forme n'est attendue, puis re-lancer.
- [ ] **Step 4 — Relancer → succès.** `npm run test -- refund-click-collect`. Sortie attendue : `2 passed`.
- [ ] **Step 5 — Type-check.** `npm run type-check`. Aucune erreur attendue.
- [ ] **Step 6 — Commit.** `git add lolett-app/__tests__/api/refund-click-collect.test.ts` puis `git commit -m "test(api): refund accepté sur commande C&C ready_for_pickup (§13 A9)"`.

---

### Task 7: Cas limite — dispute Stripe sur une commande C&C

**Files:**
- Create: `lolett-app/__tests__/api/webhook-dispute-click-collect.test.ts`
- (Sujet) `lolett-app/app/api/webhooks/stripe/route.ts` (branche `charge.dispute.created`, route L697-807)

**Objectif :** vérifier que la branche `charge.dispute.created` du webhook fonctionne **identiquement** pour une commande C&C (la logique ne dépend pas de la méthode de livraison) : la commande passe `status='disputed'`, `dispute_id` est posé, et l'alerte admin part. C'est une vérification de non-régression : le C&C ne casse pas le flux dispute existant. On mocke `Stripe.constructEvent`, `createAdminClient`, `sendDisputeAlertToAdmin`/`sendDisputeClosedToAdmin` (les deux exports réels de `@/lib/email/dispute-alert`), `@sentry/nextjs`, `after` inline.

- [ ] **Step 1 — Écrire le test qui échoue.** Créer `lolett-app/__tests__/api/webhook-dispute-click-collect.test.ts` :

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  constructEventMock,
  fromMock,
  sendDisputeAlertMock,
  sendDisputeClosedMock,
} = vi.hoisted(() => ({
  constructEventMock: vi.fn(),
  fromMock: vi.fn(),
  sendDisputeAlertMock: vi.fn().mockResolvedValue({ success: true }),
  sendDisputeClosedMock: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    webhooks: { constructEvent: constructEventMock },
  })),
}));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: fromMock }) }));
vi.mock('@/lib/email/dispute-alert', () => ({
  sendDisputeAlertToAdmin: sendDisputeAlertMock,
  sendDisputeClosedToAdmin: sendDisputeClosedMock,
}));
vi.mock('@sentry/nextjs', () => ({ captureMessage: vi.fn(), captureException: vi.fn() }));
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return { ...actual, after: (cb: () => unknown) => { void cb(); } };
});

import { POST } from '@/app/api/webhooks/stripe/route';

// Commande C&C disputée : pickup_point provider click_collect.
// La branche dispute lit orders via .eq('payment_id', ...).maybeSingle() (route L710-714),
// puis update(...).eq('id', ...). stripe_webhook_events : insert (tête) + update/delete
// (markEventProcessed / unmarkEventProcessed, try/catch silencieux).
function makeAdmin(captured: Array<Record<string, unknown>>) {
  return (table: string) => {
    if (table === 'stripe_webhook_events') {
      return {
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        delete: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      };
    }
    if (table === 'orders') {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: 'order-cc-1', order_number: 'LOL-CC-9',
                customer: { firstName: 'Marie', lastName: 'Dupont', email: 'marie.cc@test.com' },
                pickup_point: { id: 'pt-1', provider: 'click_collect', name: 'Boutique du Marais' },
                shipping_method: 'click_collect', total: 49, status: 'paid',
              },
              error: null,
            }),
          }),
        }),
        update: (payload: Record<string, unknown>) => {
          captured.push(payload);
          return { eq: vi.fn().mockResolvedValue({ error: null }) };
        },
      };
    }
    return { select: () => ({ eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }) }) };
  };
}

function disputeEvent() {
  return {
    id: `evt_${Math.random().toString(36).slice(2)}`,
    type: 'charge.dispute.created',
    data: {
      object: {
        id: 'dp_test_1',
        payment_intent: 'pi_test_cc_1',
        status: 'warning_needs_response',
        reason: 'fraudulent',
        amount: 4900, // centimes -> 49€ après /100 dans le handler
        evidence_details: { due_by: Math.floor(Date.now() / 1000) + 7 * 86400 },
      },
    },
  };
}

describe('POST /api/webhooks/stripe — dispute sur commande Click & Collect', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_x';
    constructEventMock.mockReset();
    fromMock.mockReset();
    sendDisputeAlertMock.mockClear();
  });

  it('charge.dispute.created sur commande C&C -> status disputed + alerte admin', async () => {
    const captured: Array<Record<string, unknown>> = [];
    fromMock.mockImplementation(makeAdmin(captured));
    const event = disputeEvent();
    constructEventMock.mockReturnValue(event);

    const req = new Request('http://x/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 'sig_test' },
      body: JSON.stringify(event),
    }) as unknown as import('next/server').NextRequest;
    const res = await POST(req);

    expect(res.status).toBe(200);
    const upd = captured.find((u) => u.status === 'disputed');
    expect(upd).toBeTruthy();
    expect(upd?.dispute_id).toBe('dp_test_1');
    expect(sendDisputeAlertMock).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2 — Lancer → échec attendu.** `npm run test -- webhook-dispute-click-collect`. Échec probable au premier run sur la forme exacte des chaînes mockées (le handler fait `.eq('payment_id', ...).maybeSingle()` puis `.update(...).eq('id', ...)`). **Action :** vérifier par lecture la branche `charge.dispute.created` réelle (route L697-807) pour confirmer les colonnes lues (`payment_id`) et écrites (`status`, `dispute_id`, `dispute_status`, `dispute_reason`, `dispute_amount`, `disputed_at`), aligner `makeAdmin`. Re-lancer.
- [ ] **Step 3 — Vérifier que la dispute n'a aucune logique spécifique C&C (non-régression).** Confirmer par lecture que la branche dispute n'inspecte ni `shipping_method` ni `pickup_point` — donc le test prouve que C&C ne casse rien. (Si un jour PR5 ajoutait une logique C&C dans la dispute, ce test la couvrirait.)
- [ ] **Step 4 — Relancer → succès.** `npm run test -- webhook-dispute-click-collect`. Sortie attendue : `1 passed`.
- [ ] **Step 5 — Type-check.** `npm run type-check`. Aucune erreur attendue.
- [ ] **Step 6 — Commit.** `git add lolett-app/__tests__/api/webhook-dispute-click-collect.test.ts` puis `git commit -m "test(api): dispute Stripe sur commande C&C → disputed + alerte (non-régression)"`.

---

### Task 8: Cas limite — attaque DevTools (client BE force C&C) → `POST /api/checkout/stripe` 400 (spec §13 A6)

**Files:**
- Create: `lolett-app/__tests__/api/checkout-stripe-click-collect.test.ts`
- (Sujet) `lolett-app/app/api/checkout/stripe/route.ts` (handler `POST`)

**Objectif :** test dédié A6 — un client malveillant force `shippingMethod:'click_collect'` + `shippingCountry:'BE'` dans le payload via DevTools. La route DOIT renvoyer 400 « Click & Collect FR uniquement » (logique ajoutée en PR5, spec §10.2). Et les cas « point inconnu / point inactif » (FR + click_collect mais point non valide en DB) doivent aussi renvoyer 400 (revalidation DB ajoutée en PR5, D3). On mocke `createAdminClient` (lookup `products` + `pickup_points`), `Stripe`, `@sentry/nextjs`, et `next/server`.

**Signature :** `POST(req: NextRequest)` n'a **pas** de 2e argument (contrairement aux routes `[id]`). On appelle `POST(checkoutReq(...))` sans 2e arg.

- [ ] **Step 1 — Écrire le test qui échoue.** Créer `lolett-app/__tests__/api/checkout-stripe-click-collect.test.ts` :

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  fromMock,
  sessionsCreateMock,
  customersListMock,
  customersCreateMock,
  couponsCreateMock,
} = vi.hoisted(() => ({
  fromMock: vi.fn(),
  sessionsCreateMock: vi.fn().mockResolvedValue({ id: 'cs_test_1', url: 'https://checkout.stripe.com/c/cs_test_1' }),
  customersListMock: vi.fn().mockResolvedValue({ data: [] }),
  customersCreateMock: vi.fn().mockResolvedValue({ id: 'cus_test_1' }),
  couponsCreateMock: vi.fn().mockResolvedValue({ id: 'coupon_1' }),
}));

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: fromMock }) }));
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: { sessions: { create: sessionsCreateMock } },
    customers: { list: customersListMock, create: customersCreateMock, update: vi.fn() },
    coupons: { create: couponsCreateMock },
  })),
}));
vi.mock('@sentry/nextjs', () => ({ captureMessage: vi.fn(), captureException: vi.fn() }));
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return { ...actual, after: (cb: () => unknown) => { void cb(); } };
});

import { POST } from '@/app/api/checkout/stripe/route';

// products.select(...).in(...) -> [produit] ; pickup_points.select(...).eq(...).maybeSingle() -> point.
// D3 : la revalidation PR5 lit pickup_points en .maybeSingle() (1 ou 2 .eq tolérés).
function makeAdmin(point: { id: string; is_active: boolean } | null) {
  return (table: string) => {
    if (table === 'products') {
      return {
        select: () => ({
          in: vi.fn().mockResolvedValue({ data: [{ id: 'p1', name: 'Robe', price: 49 }], error: null }),
        }),
      };
    }
    if (table === 'pickup_points') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: point, error: null }) }),
            maybeSingle: vi.fn().mockResolvedValue({ data: point, error: null }),
          }),
        }),
      };
    }
    // promo_codes / gift_cards / autres : no-op chainable.
    return { select: () => ({ eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }) }) };
  };
}

const CUSTOMER_BE = {
  firstName: 'Marie', lastName: 'Dupont', email: 'marie.cc@test.com',
  phone: '+32470123456', address: '12 rue de Bruxelles', city: 'Bruxelles',
  postalCode: '1000', country: 'BE',
};
const CUSTOMER_FR = {
  firstName: 'Marie', lastName: 'Dupont', email: 'marie.cc@test.com',
  phone: '0612345678', address: '12 rue de la Paix', city: 'Paris',
  postalCode: '75001', country: 'FR',
};
const ITEMS = [{ productId: 'p1', productName: 'Robe', size: 'M', quantity: 1 }];

// req.json() est natif sur Request ; le handler ne lit que req.json() + process.env.
function checkoutReq(body: unknown) {
  return new Request('http://x/api/checkout/stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest;
}

describe('POST /api/checkout/stripe — garde-fou Click & Collect FR-only (A6)', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    fromMock.mockReset();
    sessionsCreateMock.mockClear();
  });

  it('A6 : BE + click_collect (forcé via DevTools) -> 400 et aucune session Stripe créée', async () => {
    fromMock.mockImplementation(makeAdmin({ id: 'pt-1', is_active: true }));

    const res = await POST(checkoutReq({
      items: ITEMS,
      customer: CUSTOMER_BE,
      shippingMethod: 'click_collect',
      shippingCountry: 'BE',
      pickupPoint: { id: 'pt-1', provider: 'click_collect', name: 'Boutique', address: 'X', postalCode: '75001', city: 'Paris', country: 'FR' },
    }));

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(String(json.error)).toMatch(/click ?& ?collect|france|fr uniquement/i);
    expect(sessionsCreateMock).not.toHaveBeenCalled();
  });

  it('point inconnu en DB + FR + click_collect -> 400 (snapshot client non fiable)', async () => {
    fromMock.mockImplementation(makeAdmin(null));

    const res = await POST(checkoutReq({
      items: ITEMS,
      customer: CUSTOMER_FR,
      shippingMethod: 'click_collect',
      shippingCountry: 'FR',
      pickupPoint: { id: 'ghost', provider: 'click_collect', name: 'X', address: 'Y', postalCode: '75001', city: 'Paris', country: 'FR' },
    }));

    expect(res.status).toBe(400);
    expect(sessionsCreateMock).not.toHaveBeenCalled();
  });

  it('point inactif (is_active=false) + FR + click_collect -> 400', async () => {
    fromMock.mockImplementation(makeAdmin({ id: 'pt-1', is_active: false }));

    const res = await POST(checkoutReq({
      items: ITEMS,
      customer: CUSTOMER_FR,
      shippingMethod: 'click_collect',
      shippingCountry: 'FR',
      pickupPoint: { id: 'pt-1', provider: 'click_collect', name: 'X', address: 'Y', postalCode: '75001', city: 'Paris', country: 'FR' },
    }));

    expect(res.status).toBe(400);
    expect(sessionsCreateMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2 — Lancer → échec attendu.** `npm run test -- checkout-stripe-click-collect`. Sortie attendue : le 1er test (A6) échoue avec un statut ≠ 400 si PR5 n'a pas ajouté le garde-fou `if (shippingMethod==='click_collect' && shippingCountry!=='FR') return 400` (spec §10.2 étape 2). Les tests « point inconnu/inactif » échouent si PR5 ne revalide pas `pickup_points` en DB côté checkout (le code actuel L82 ne revalide PAS — il ne gère que `mondial_relay`). **Si échec :** remonter à PR5 (contrats §12.2 + A6). Ne pas patcher la route.
- [ ] **Step 3 — Aligner les chaînes mockées.** Confirmer par Grep l'ordre des `.from(...)` ajoutés par PR5 (lookup `pickup_points` après `products`), la colonne lue (`is_active`) et le terminal (`.maybeSingle()`, D3). **Si le handler PR5 utilise `.single()`, c'est une violation de D3 → remonter à PR5.** Re-lancer.
- [ ] **Step 4 — Relancer → succès.** `npm run test -- checkout-stripe-click-collect`. Sortie attendue : `3 passed`.
- [ ] **Step 5 — Type-check.** `npm run type-check`. Aucune erreur attendue.
- [ ] **Step 6 — Commit.** `git add lolett-app/__tests__/api/checkout-stripe-click-collect.test.ts` puis `git commit -m "test(api): garde-fou C&C FR-only + revalidation point au checkout (§13 A6)"`.

---

### Task 9: Cas limite — désactivation d'un point en cours de session (point devient `is_active=false` entre session et webhook) → `payment_review`

**Files:**
- Modify: `lolett-app/__tests__/api/webhook-click-collect.test.ts` (ajouter un `it` dédié au scénario temporel)

**Objectif :** scénario « mid-order » distinct d'A10 statique : la cliente sélectionne un point **actif**, le snapshot part dans la metadata Stripe (avec `is_active` non re-vérifiable depuis la metadata), puis Lola **désactive** le point dans `/admin/pickup-points` AVANT que le webhook n'arrive. Au moment du webhook, la revalidation DB voit `is_active=false` → `payment_review` + skip email. C'est exactement le 2e cas d'A10 (point désactivé) mais documenté comme scénario temporel ; on l'isole pour la traçabilité.

- [ ] **Step 1 — Écrire le test qui échoue.** Ajouter dans `lolett-app/__tests__/api/webhook-click-collect.test.ts` un nouveau `it` dans le `describe` existant :

```ts
  it('mid-order : point désactivé entre session et webhook -> payment_review, aucun email confirmation', async () => {
    const capturedUpdates: Array<Record<string, unknown>> = [];
    // Au moment du webhook, la DB renvoie le point en is_active=false (désactivé par Lola après la session).
    fromMock.mockImplementation(makeAdmin({ point: { id: 'pt-mid', is_active: false }, capturedUpdates }));

    const snapshot = {
      id: 'pt-mid', provider: 'click_collect', name: 'Boutique du Marais',
      address: '8 rue des Archives', postalCode: '75004', city: 'Paris', country: 'FR',
    };
    const res = await POST(makeRequest(buildEvent(snapshot)) as unknown as import('next/server').NextRequest);

    expect(res.status).toBe(200);
    // Statut basculé en payment_review.
    expect(capturedUpdates.some((u) => u.status === 'payment_review')).toBe(true);
    // Aucun email confirmation (cliente ne reçoit rien tant que Lola n'a pas tranché).
    expect(sendOrderConfirmationMock).not.toHaveBeenCalled();
  });
```

- [ ] **Step 2 — Lancer → échec attendu.** `npm run test -- webhook-click-collect`. Échec si la revalidation `is_active` n'est pas faite côté webhook (PR5). **Si échec :** remonter à PR5 (même contrat que Task 4, dimension temporelle).
- [ ] **Step 3 — Relancer → succès.** `npm run test -- webhook-click-collect`. Sortie attendue : `4 passed` (3 de Task 4 + 1 ici).
- [ ] **Step 4 — Type-check.** `npm run type-check`. Aucune erreur attendue.
- [ ] **Step 5 — Commit.** `git add lolett-app/__tests__/api/webhook-click-collect.test.ts` puis `git commit -m "test(api): point désactivé mid-order → payment_review (cas limite temporel)"`.

---

### Task 10: Cartographie des scénarios d'acceptation A1–A10 (spec §13)

**Files:**
- Modify: `lolett-app/e2e/click-collect.spec.ts` (ajout d'un bloc de commentaire `ACCEPTANCE MAP` en tête, sous le bandeau NOTE CADRAGE déjà présent).

**Objectif :** matérialiser la couverture A1–A10 directement dans le repo (pas de fichier `.md` séparé), pour qu'un futur dev sache instantanément ce qui est testé vs vérifié à la main.

- [ ] **Step 1 — Écrire le bloc de cartographie en tête de `lolett-app/e2e/click-collect.spec.ts`** (sous le bandeau NOTE CADRAGE déjà présent) :

```ts
/*
 * CARTOGRAPHIE DES SCÉNARIOS D'ACCEPTATION (spec §13) — couverture PR6
 * ------------------------------------------------------------------------
 * A1  Cliente FR commande en C&C (email confirmation + point + admin)
 *       -> PARTIEL AUTO : E2E click-collect.spec.ts (parcours jusqu'au POST stripe,
 *          payload click_collect + pickupPoint vérifié). Le chemin webhook VALIDE
 *          (point OK -> paid -> sendOrderConfirmation) N'EST PAS testé en intégration
 *          (mock du pipeline paid trop lourd, cf. Note de cadrage 10) -> EMAIL réel +
 *          confirmation = VÉRIF MANUELLE.
 * A2  Lola voit la commande, bouton "Marquer prête au retrait" visible,
 *     page expédition masquée
 *       -> VÉRIF MANUELLE (UI admin /admin/orders/[id], rendu serveur PR4).
 *          Pas de test unitaire fiable du rendu conditionnel page expédition.
 * A3  "Marquer prête au retrait" -> ready_for_pickup + ready_for_pickup_at +
 *     pickup_code + email parti (PR4)
 *       -> COUVERT : admin-orders-pickup.test.ts (1er it).
 * A4  "Marquer retirée" -> picked_up + picked_up_at + aucun email (PR4)
 *       -> COUVERT : admin-orders-pickup.test.ts (2e it).
 * A5  RGPD suppression compte : commandes C&C anonymisées comme les autres
 *       -> VÉRIF MANUELLE / hors périmètre C&C (flux RGPD existant inchangé,
 *          le snapshot pickup_point suit le même traitement que l'adresse).
 * A6  Client BE force C&C via DevTools -> route Stripe 400 "C&C FR uniquement" (PR5)
 *       -> COUVERT : checkout-stripe-click-collect.test.ts (1er it).
 * A7  Lola désactive un point référencé par 12 commandes : modal "Référencé par
 *     12 commandes — masquer plutôt que supprimer", toggle is_active=false (PR4)
 *       -> VÉRIF MANUELLE (UI /admin/pickup-points + RPC count_orders_with_pickup_point).
 *          Le comptage RPC est testé en PR4 ; le modal est de l'UI admin.
 * A8  Lola modifie le texte email "Prête au retrait" depuis /admin/emails :
 *     aperçu OK avec MOCK_PICKUP_DATA, prochaine transition utilise le nouveau texte (PR3/PR4)
 *       -> VÉRIF MANUELLE (aperçu /admin/emails). Le sender interpolate() est testé
 *          unitairement en PR3 (pattern order-cancelled.test.ts) ; le rendu live = manuel.
 * A9  Client C&C n'est pas venu : RefundDialog accepte ready_for_pickup, refund OK (PR4 - D2)
 *       -> PARTIEL AUTO : refund-click-collect.test.ts (1er it) couvre la ROUTE
 *          POST /refund. Le composant RefundDialog (liste recâblée sur REFUNDABLE_STATUSES
 *          par PR4 - D2) = VÉRIF MANUELLE (UI). PR4 recâble route L36 + RefundDialog.tsx.
 * A10 Webhook session C&C sans pickup_point valide -> payment_review, log Sentry,
 *     aucun email client (PR5)
 *       -> COUVERT : webhook-click-collect.test.ts (3 it + 1 mid-order).
 *
 * Résumé : A3, A4, A6, A10 automatisés (intégration vitest).
 *          A1 partiel auto (E2E payload) + webhook valide/email réel = manuel.
 *          A9 partiel auto (route refund) + RefundDialog = manuel.
 *          A2, A5, A7, A8 = vérif manuelle (UI / RGPD / aperçu live).
 */
```

- [ ] **Step 2 — Type-check.** `npm run type-check`. Un bloc de commentaire ne change rien à la compilation ; confirmer 0 erreur.
- [ ] **Step 3 — Vérification manuelle de la checklist A2/A5/A7/A8/A9(UI)/A1(email)** (à exécuter au moins une fois, en `npm run dev`, avec une commande C&C de test en DB) :
  - A1 (email réel) : déclencher une transition `ready_for_pickup` sur une commande C&C de test → l'email « Prête au retrait » est reçu avec le code et le point. La confirmation initiale C&C (post-paiement) mentionne « vous recevrez un email avec votre code ».
  - A2 : ouvrir `/admin/orders/[id]` d'une commande C&C `paid`/`confirmed` → le bouton/option « Marquer prête au retrait » est proposé, et le bloc « Étiquette d'expédition » (`expedition/page.tsx`) est masqué pour une commande C&C.
  - A5 : déclencher la suppression RGPD d'un compte ayant une commande C&C → la commande est anonymisée comme une commande domicile (nom/email scrubbés), le snapshot `pickup_point` peut rester (donnée boutique, pas perso).
  - A7 : dans `/admin/pickup-points`, tenter de désactiver un point référencé par ≥1 commande → le modal affiche « Référencé par N commandes — masquer plutôt que supprimer » et le toggle passe `is_active=false`.
  - A8 : `/admin/emails`, ouvrir le template `order_ready_for_pickup`, modifier le `body_text`, cliquer « Aperçu » → le rendu utilise `MOCK_PICKUP_DATA` (Marie, `LOL-20260530-TEST`, code `LOL-A7K2X`, point « Boutique du Marais »). Sauver, puis déclencher une transition `ready_for_pickup` sur une commande de test → l'email reçu reflète le nouveau texte.
  - A9 (UI) : ouvrir `RefundDialog` sur une commande C&C `ready_for_pickup` → le dialog autorise le remboursement (la liste des statuts remboursables, recâblée par PR4 sur `REFUNDABLE_STATUSES`, inclut `ready_for_pickup`).
- [ ] **Step 4 — Commit.** `git add lolett-app/e2e/click-collect.spec.ts` puis `git commit -m "docs(test): cartographie A1–A10 (auto vs manuel) en tête du spec E2E C&C"`.

---

## Vérification finale PR6

- [ ] **Type-check vert :** `npm run type-check` → aucune erreur (zéro `any`, tous imports en alias `@/`, `ShippingMethod` inclut `'click_collect'`, `PickupPoint` a `provider`). Le `tsconfig.json` incluant `**/*.ts`, les fichiers `e2e/*.spec.ts` SONT typechekés — vérifier qu'aucun import `@playwright/test` ni cast n'y génère d'erreur.
- [ ] **Tests unitaires/intégration verts :** `npm run test` → tous verts, dont les nouveaux fichiers :
  - `__tests__/api/webhook-click-collect.test.ts` (A10 + mid-order — 4 it)
  - `__tests__/api/admin-orders-pickup.test.ts` (A3, A4 + transition interdite — 3 it)
  - `__tests__/api/refund-click-collect.test.ts` (A9 route + statut non remboursable — 2 it)
  - `__tests__/api/webhook-dispute-click-collect.test.ts` (dispute non-régression — 1 it)
  - `__tests__/api/checkout-stripe-click-collect.test.ts` (A6 + point inconnu/inactif — 3 it)
- [ ] **E2E verts :** `npm run test:e2e -- click-collect.spec.ts` → 3 tests passent (parcours C&C jusqu'au POST stripe, bascule MR→C&C, bascule FR→BE). Sélecteurs DOM confirmés contre les composants réels de PR3 (plus aucun `À CONFIRMER` non résolu).
- [ ] **`npm run validate`** (lint + type-check) → vert.
- [ ] **Couverture spec §12.4 :** les 3 parcours E2E (§12.4.1 partiel + justification Stripe, §12.4.2, §12.4.3) sont présents et passent.
- [ ] **Couverture spec §13 (A1–A10) :** la cartographie en tête de `click-collect.spec.ts` est exacte ; A3/A4/A6/A10 automatisés et verts ; A1 partiel auto + email manuel ; A9 partiel auto (route) + RefundDialog manuel ; A2/A5/A7/A8 vérifiés manuellement au moins une fois (checklist Task 10 Step 3 cochée).
- [ ] **Aucune régression amont masquée :** si un test échoue parce que `'click_collect'` / `ready_for_pickup` / le recâblage `REFUNDABLE_STATUSES` (PR4) / l'extension `ORDER_STATUSES` (PR4) / le garde-fou FR-only (PR5) / la revalidation `.maybeSingle()` (PR5, D3) manque, le manque a été **remonté à la PR responsable** (PR2/PR3/PR4/PR5) et corrigé là-bas — jamais contourné dans un test.
- [ ] **Cohérence des symboles partagés :** le sender mocké est `sendOrderReadyForPickupEmail` (clé `vi.mock` + variable + assertions) ; les lookups `pickup_points` mockés sont en `.maybeSingle()` (D3) ; la metadata webhook de test porte clés plates `pickup_point_id`/`pickup_provider` + snapshot JSON camelCase (D5).
- [ ] **Sécurité :** aucun secret commité (clés Stripe dans les tests = `sk_test_x`/`whsec_test_x` factices uniquement, jamais de vraie clé).

## Lien avec les autres PRs

- **PR1 (migrations DB)** — fournit la table `pickup_points` (`is_active`, `sort_order`), les colonnes `orders.ready_for_pickup_at`/`picked_up_at`/`pickup_code` (+ index unique partiel), la RPC `count_orders_with_pickup_point` (utilisée par A7) et le seed email `order_ready_for_pickup` en `{{var}}` (double accolade) + signoff `♥`. Les tests PR6 supposent ces colonnes/contraintes présentes (notamment `pickup_code` unique → l'assignation atomique testée en A3 via `assignPickupCodeAtomic`).
- **PR2 (types + constantes + cart store)** — ajoute `'click_collect'` à `ShippingMethod`/`VALID_*` (webhook L21, checkout L20), transforme `PickupPoint` en union discriminée par `provider`, fournit `REFUNDABLE_STATUSES` (incluant `ready_for_pickup`) dans `@/lib/constants`, `ORDER_STATUS_VALUES`/`ORDER_STATUS_TRANSITIONS`, fait que `computeShippingCost('FR','click_collect')=0` et `('BE','click_collect')` throw (test unitaire **PR2**, pas PR6), et reset `pickupPoint` à tout changement de méthode (spec §5.5). Les E2E (Tasks 1-3) et l'intégration (Tasks 4-9) en dépendent directement. **Si un symbole manque, PR6 ne compile pas.**
- **PR3 (helper code + emails)** — fournit `assignPickupCodeAtomic` (`lib/orders/pickup-code.ts`), le template `order-ready-for-pickup-v3`, et surtout le sender **`sendOrderReadyForPickupEmail`** (export EXACT, `lib/email/order-ready-for-pickup.ts`, signature D1 : `pickupPoint: PickupPoint | null`, retour `Promise<void>`), plus les branches CMS preview/test avec `MOCK_PICKUP_DATA` (A8). Task 5 mocke `sendOrderReadyForPickupEmail` et asserte son payload ; si l'export n'existe pas (ou n'a pas le suffixe `Email`), Task 5 échoue → manque PR3.
- **PR4 (UI admin + transitions PATCH + refund recâblé)** — D4/D2 : fournit `/admin/pickup-points` (CRUD + reorder + modal A7), l'extension du `PATCH /api/admin/orders/[id]` (statuts `ready_for_pickup`/`picked_up`, transitions filtrées par `ORDER_STATUS_TRANSITIONS`, auto-set `ready_for_pickup_at`/`picked_up_at`, génération `pickup_code` via `assignPickupCodeAtomic`, déclenchement `sendOrderReadyForPickupEmail` — A3/A4), ET le **recâblage de `REFUNDABLE_STATUSES`** dans `app/api/admin/orders/[id]/refund/route.ts` (L36) + `components/admin/RefundDialog.tsx` (~L52) sur `@/lib/constants` (A9 — D2). **Tasks 5 et 6 dépendent de PR4** : chaque test rouge ici pointe un contrat PR4 non honoré (transitions C&C, code, email, statut remboursable).
- **PR5 (UI client + Stripe + facture)** — fournit : revalidation `pickup_points` au checkout en `.maybeSingle()` (A6 + point inconnu/inactif, D3), ajout des clés metadata plates `pickup_point_id`/`pickup_provider` au checkout (D5), revalidation au webhook (`.maybeSingle()`, AVANT mark-paid) → `payment_review` + skip email (A10 + mid-order, D3/Note 11). **Tasks 4, 8, 9 dépendent de PR5** : chaque test rouge ici pointe un contrat PR5 non honoré (garde-fou FR-only, revalidation DB, bascule `payment_review`).
- **Dépendance globale :** PR6 est le filet de sécurité de PR4 ET PR5 et doit être exécutée **après** le merge de PR1-5. Une transition C&C cassée (A3/A4/A9) pointe PR4 ; un garde-fou checkout/webhook cassé (A6/A10) pointe PR5.
