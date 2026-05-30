import { test, expect, type Page } from '@playwright/test';
import { dismissCookieConsent } from './helpers';

/*
 * NOTE CADRAGE PR6 — paiement Stripe non automatisable en E2E local.
 * ------------------------------------------------------------------------
 * `POST /api/checkout/stripe` crée une checkout.session Stripe et renvoie une
 * URL `checkout.stripe.com` (hors baseURL) avec saisie carte 4242 4242 4242 4242
 * + parfois 3DS : non déterministe, hors périmètre Playwright local.
 *
 * Décision : le parcours C&C E2E va JUSQU'AU POST /api/checkout/stripe inclus.
 * On intercepte la requête via `page.route` pour CAPTURER le payload (preuve que
 * shippingMethod:'click_collect' + pickupPoint partent au serveur) et on
 * court-circuite la création de session (on renvoie une fausse { url } interne
 * pour ne pas quitter le domaine de test). On asserte le payload, pas le paiement.
 *
 * La suite (webhook → paid → email confirmation → ready_for_pickup + pickup_code
 * + email → picked_up) est couverte par les tests d'intégration vitest :
 *   - __tests__/api/webhook-stripe-click-collect.test.ts   (A10, point invalide → payment_review)
 *   - __tests__/checkout/fulfill-order-click-collect.test.ts (point désactivé mid-order → payment_review)
 *   - __tests__/api/admin-orders-patch-click-collect.test.ts (A3/A4 transitions + code + email)
 *   - __tests__/api/admin-orders-refund-ready-for-pickup.test.ts (A9 refund ready_for_pickup)
 *   - __tests__/api/checkout-stripe-click-collect.test.ts   (A6 garde-fou FR-only + revalidation point)
 *   - __tests__/api/webhook-dispute-click-collect.test.ts   (dispute non-régression)
 *
 * PRÉ-REQUIS RECETTE/CI : un environnement avec au moins UN point de retrait
 * actif en zone FR (pickup_points.is_active=true, country='FR'). Le composant
 * ClickCollectPicker charge les points via le client Supabase public (RLS
 * is_active=true). Sans point seedé, le test « parcours complet » sera SKIP
 * (cf. selectFirstPickupPoint qui renvoie false si la liste est vide).
 */

/*
 * CARTOGRAPHIE DES SCÉNARIOS D'ACCEPTATION (spec §13) — couverture PR6
 * ------------------------------------------------------------------------
 * A1  Cliente FR commande en C&C (email confirmation + point + admin)
 *       → PARTIEL AUTO : ce fichier (parcours jusqu'au POST stripe, payload
 *          click_collect + pickupPoint vérifié). Le chemin webhook VALIDE
 *          (point OK → paid → sendOrderConfirmation) est couvert côté intégration
 *          par __tests__/checkout/fulfill-order-click-collect.test.ts (1er it).
 *          L'EMAIL réel reçu = VÉRIF MANUELLE en recette.
 * A2  Lola voit la commande, bouton "Marquer prête au retrait" visible,
 *     page expédition masquée
 *       → VÉRIF MANUELLE (UI admin /admin/orders/[id], rendu serveur PR4).
 * A3  "Marquer prête au retrait" → ready_for_pickup + ready_for_pickup_at +
 *     pickup_code + email parti (PR4)
 *       → COUVERT : __tests__/api/admin-orders-patch-click-collect.test.ts
 *          ("ready_for_pickup valide : génère le code, pose timestamp, envoie l'email").
 * A4  "Marquer retirée" → picked_up + picked_up_at + aucun email (PR4)
 *       → COUVERT : __tests__/api/admin-orders-patch-click-collect.test.ts
 *          ("picked_up : pose picked_up_at et n'envoie aucun email").
 * A5  RGPD suppression compte : commandes C&C anonymisées comme les autres
 *       → VÉRIF MANUELLE / hors périmètre C&C (flux RGPD existant inchangé,
 *          le snapshot pickup_point suit le même traitement que l'adresse).
 * A6  Client BE force C&C via DevTools → route Stripe 400 "C&C FR uniquement" (PR5)
 *       → COUVERT : __tests__/api/checkout-stripe-click-collect.test.ts
 *          ("rejette click_collect hors France (400)" + point inconnu/inactif/provider).
 * A7  Lola désactive un point référencé par N commandes : modal "Référencé par
 *     N commandes — masquer plutôt que supprimer", toggle is_active=false (PR4)
 *       → COUVERT (logique) : __tests__/api/admin-pickup-points-usage.test.ts
 *          (RPC count_orders_with_pickup_point). Le modal = VÉRIF MANUELLE (UI).
 * A8  Lola modifie le texte email "Prête au retrait" depuis /admin/emails :
 *     aperçu OK avec MOCK_PICKUP_DATA, prochaine transition utilise le nouveau texte
 *       → VÉRIF MANUELLE (aperçu /admin/emails live).
 * A9  Client C&C n'est pas venu : RefundDialog accepte ready_for_pickup, refund OK (PR4 — D2)
 *       → PARTIEL AUTO : __tests__/api/admin-orders-refund-ready-for-pickup.test.ts
 *          (route POST /refund accepte ready_for_pickup). Le composant RefundDialog
 *          (liste recâblée sur REFUNDABLE_STATUSES) = VÉRIF MANUELLE (UI).
 * A10 Webhook session C&C sans pickup_point valide → payment_review, log Sentry,
 *     aucun email client (PR5)
 *       → COUVERT : __tests__/api/webhook-stripe-click-collect.test.ts
 *          ("bascule payment_review + skip email quand le point C&C est invalide").
 *          Cas mid-order (point désactivé entre paiement et fulfillment) :
 *          __tests__/checkout/fulfill-order-click-collect.test.ts.
 *
 * Résumé : A3, A4, A6, A7(logique), A10 automatisés (intégration vitest).
 *          A1 partiel auto (E2E payload + fulfill intégration) + email réel = manuel.
 *          A9 partiel auto (route refund) + RefundDialog = manuel.
 *          A2, A5, A8 = vérif manuelle (UI / RGPD / aperçu live).
 * Matrice détaillée : lolett-app/docs/click-collect-tests-coverage.md.
 */

const CART_KEY = 'lolett-cart';

// Helper panier — pattern validé de checkout.spec.ts.
async function addFirstProductToCart(page: Page) {
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

// Le radiogroup "Mode de livraison" (ShippingMethodSelect.tsx) rend des
// <button role="radio"> ; le label C&C = SHIPPING_METHODS.click_collect.label
// = "Retrait en boutique (Click & Collect)".
function methodRadio(page: Page, name: RegExp) {
  return page
    .getByRole('radiogroup', { name: 'Mode de livraison' })
    .getByRole('radio', { name });
}

const CC_LABEL = /retrait en boutique|click ?& ?collect/i;
const MR_LABEL = /point relais|mondial relay/i;

async function selectClickCollect(page: Page) {
  const cc = methodRadio(page, CC_LABEL);
  await expect(cc).toBeVisible({ timeout: 10_000 });
  await cc.click();
}

// Sélectionne le 1er point de retrait rendu par ClickCollectPicker.tsx.
// Les points sont des <button type="button"> sans rôle dédié, à l'intérieur du
// conteneur aria-live="polite". Renvoie true si un point a été cliqué, false si
// la liste est vide (env sans pickup_points seedé → le test appelant SKIP).
async function selectFirstPickupPoint(page: Page): Promise<boolean> {
  const picker = page.locator('div[aria-live="polite"]');
  await expect(picker).toBeVisible({ timeout: 10_000 });
  const pointBtn = picker.locator('button[type="button"]').first();
  try {
    await expect(pointBtn).toBeVisible({ timeout: 8_000 });
  } catch {
    return false;
  }
  await pointBtn.click();
  return true;
}

// Remplit l'étape 1 (formulaire de livraison) — champs par name, pattern checkout.spec.ts.
async function fillDeliveryForm(page: Page) {
  await page.locator('input[name="firstName"]').fill('Marie');
  await page.locator('input[name="lastName"]').fill('Dupont');
  await page.locator('input[name="email"]').fill('marie.cc@test.com');
  await page.locator('input[name="phone"]').fill('0612345678');
  await page.locator('input[name="address"]').fill('12 rue de la Paix');
  // Ferme l'autocomplete d'adresse.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.locator('input[name="postalCode"]').fill('75001', { force: true });
  await page.locator('input[name="city"]').fill('Paris', { force: true });
}

function readCartState(page: Page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as { state?: Record<string, unknown> }) : { state: {} };
    const state = parsed.state ?? {};
    return {
      method: (state.shippingMethod as string | undefined) ?? null,
      country: (state.shippingCountry as string | undefined) ?? null,
      point: (state.pickupPoint as Record<string, unknown> | null | undefined) ?? null,
    };
  }, CART_KEY);
}

// ─────────────────────────────────────────────────────────────────────────
// Parcours C&C complet (jusqu'à la redirection Stripe — interceptée)
// ─────────────────────────────────────────────────────────────────────────
test.describe('Click & Collect — parcours complet (jusqu\'au POST /api/checkout/stripe)', () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }) => {
    await dismissCookieConsent(page);
    await page.goto('/');
    await page.evaluate((key) => localStorage.removeItem(key), CART_KEY);
    await addFirstProductToCart(page);
  });

  test('FR : choisir C&C + un point envoie click_collect + pickupPoint au POST /api/checkout/stripe', async ({ page }) => {
    // Intercepte la création de session Stripe : capture le payload SANS partir
    // sur checkout.stripe.com (hors domaine, non déterministe).
    let capturedBody: Record<string, unknown> | null = null;
    await page.route('**/api/checkout/stripe', async (route) => {
      capturedBody = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'http://localhost:3000/checkout?stubbed=1' }),
      });
    });

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    await fillDeliveryForm(page);
    await selectClickCollect(page);

    const hasPoint = await selectFirstPickupPoint(page);
    test.skip(!hasPoint, 'Aucun point de retrait actif seedé dans cet environnement — parcours non exécutable.');

    // Étape 1 → étape paiement.
    await page.getByRole('button', { name: 'Continuer' }).click();

    // Étape paiement : bouton "Payer {prix}" déclenche le POST /api/checkout/stripe.
    const payBtn = page.getByRole('button', { name: /^Payer\b/i });
    await expect(payBtn).toBeEnabled({ timeout: 10_000 });
    await payBtn.click();

    await expect.poll(() => capturedBody, { timeout: 15_000 }).not.toBeNull();

    const body = capturedBody as unknown as {
      shippingMethod?: string;
      shippingCountry?: string;
      pickupPoint?: { id?: string; provider?: string } | null;
    };
    expect(body.shippingMethod).toBe('click_collect');
    expect(body.shippingCountry).toBe('FR');
    expect(body.pickupPoint).toBeTruthy();
    expect(body.pickupPoint?.id).toBeTruthy();
    // provider posé côté client par ClickCollectPicker (union discriminée).
    expect(body.pickupPoint?.provider).toBe('click_collect');
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Bascules de méthode (pur UI, sans paiement)
// ─────────────────────────────────────────────────────────────────────────
test.describe('Click & Collect — bascules de méthode', () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }) => {
    await dismissCookieConsent(page);
    await page.goto('/');
    await page.evaluate((key) => localStorage.removeItem(key), CART_KEY);
    await addFirstProductToCart(page);
  });

  // spec §12.4.2 — passer de Mondial Relay (avec point MR) à Click & Collect
  // doit réinitialiser pickupPoint (aucun résidu MR). Le store reset à tout
  // changement de méthode (features/cart/store.ts setShippingMethod).
  test('MR → C&C reset le pickupPoint (aucun résidu Mondial Relay)', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // 1. Sélectionner Mondial Relay puis INJECTER un point MR dans le store
    //    (le widget MR Leaflet n'est pas pilotable de façon fiable en E2E ; on
    //    injecte l'état comme le ferait OnParcelShopSelected).
    const mr = methodRadio(page, MR_LABEL);
    await expect(mr).toBeVisible({ timeout: 10_000 });
    await mr.click();

    await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
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
      localStorage.setItem(key, JSON.stringify(parsed));
    }, CART_KEY);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 2. Basculer sur Click & Collect.
    await selectClickCollect(page);

    // 3. Le point MR doit avoir disparu du store (reset attendu).
    const after = await readCartState(page);
    expect(after.method).toBe('click_collect');
    // Soit point null (reset franc), soit un point dont le provider n'est PAS
    // mondial_relay — dans tous les cas, AUCUN résidu MR.
    if (after.point) {
      expect((after.point as { provider?: string }).provider).not.toBe('mondial_relay');
      expect((after.point as { id?: string }).id).not.toBe('MR-12345');
    }
  });

  // spec §12.4.3 — C&C sélectionné en FR, puis pays → BE : le store rebascule sur
  // 'home' et vide pickupPoint (setShippingCountry), et l'option C&C disparaît du
  // sélecteur (restrictTo:['FR']).
  test('FR (C&C) → BE force shippingMethod=home et vide le point', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // 1. Sélectionner Click & Collect en FR.
    await selectClickCollect(page);
    // Sélection d'un point best-effort (n'est pas requis pour la garantie testée).
    await selectFirstPickupPoint(page);

    const before = await readCartState(page);
    expect(before.method).toBe('click_collect');

    // 2. Changer le pays vers BE (select natif name="country", valeur = code ISO).
    const countrySelect = page.locator('select[name="country"]');
    await expect(countrySelect).toBeVisible({ timeout: 10_000 });
    await countrySelect.selectOption('BE');
    await page.waitForTimeout(500);

    // 3. Le store doit être repassé sur home + point vidé.
    const after = await readCartState(page);
    expect(after.country).toBe('BE');
    expect(after.method).toBe('home');
    expect(after.point).toBeNull();

    // 4. L'option C&C ne doit plus être proposée en BE.
    await expect(methodRadio(page, CC_LABEL)).toHaveCount(0);
  });

  // L'option C&C n'est visible qu'en FR, et son coût est affiché "Offerte"
  // (computeShippingCost FR/click_collect = 0).
  test('l\'option Click & Collect est visible en FR avec le coût "Offerte" et absente en BE', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // FR par défaut : l'option C&C est présente.
    const ccFr = methodRadio(page, CC_LABEL);
    await expect(ccFr).toBeVisible({ timeout: 10_000 });
    // Le coût "Offerte" est rendu dans l'option (panier non vide).
    await expect(ccFr).toContainText(/offerte/i);

    // Passage en BE : l'option C&C disparaît.
    await page.locator('select[name="country"]').selectOption('BE');
    await page.waitForTimeout(500);
    await expect(methodRadio(page, CC_LABEL)).toHaveCount(0);
  });
});
