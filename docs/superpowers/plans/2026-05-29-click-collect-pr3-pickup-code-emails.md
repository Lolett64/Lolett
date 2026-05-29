# Click & Collect — PR3 : Code de retrait & emails — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Générer un code de retrait unique et atomique pour les commandes Click & Collect, et envoyer/prévisualiser l'email « Commande prête au retrait » (template v3 + sender + branches CMS), tout en adaptant les blocs point de retrait des emails existants (confirmation client + notif admin) au discriminant `provider` (`mondial_relay` vs `click_collect`).

**Architecture:** PR3 couvre les §8 (génération atomique du code) et §9 (emails) du spec — à l'exception du branchement PATCH (§8.2) et du skip `order-shipped` (§9.4), tous deux délégués à PR4 (cf. décision D4 et « Lien avec les autres PRs »). On ajoute un helper pur `lib/orders/pickup-code.ts` (génération cryptographique + UPDATE atomique idempotent sur `orders` via la clause `.is('pickup_code', null)` + retry sur `23505`), un nouveau template HTML inline `order-ready-for-pickup-v3.ts` rendu selon la charte v3, et un sender `order-ready-for-pickup.ts` (pattern Groupe A pour la structure try/catch + `interpolate()`, MAIS signature `Promise<void>` sans `return result` — cf. §9.2, guards anti-email-partiel + Sentry). On adapte les deux templates existants (`order-confirmation-v3`, `order-new-admin`) pour le bloc point de retrait conditionnel par `provider` (au sens `PickupPoint.provider`, PAS un provider d'envoi : `sendHtmlEmail` Brevo→SMTP→Resend reste inchangé), et on étend les 3 routes CMS (preview / test / preview-all) + la table `VARIABLES_BY_TEMPLATE`.

**Tech Stack:** TypeScript strict, Next.js (App Router), Supabase JS (`@supabase/supabase-js`), `crypto.getRandomValues`, Sentry (`@sentry/nextjs`), templates email HTML inline (Cormorant Garamond + DM Sans), Vitest (jsdom), helper partagé `interpolate()`.

---

## Notes de cadrage (corrections vs spec)

Écarts entre le spec et la réalité du code, à respecter STRICTEMENT pour cette PR :

1. **`escapeHtml` existe DÉJÀ** à `@/lib/utils/escape-html` (`lolett-app/lib/utils/escape-html.ts`), testé par `lolett-app/__tests__/lib/utils/escape-html.test.ts`. La Task 2 « créer `lib/email/escape-html.ts` » serait un **doublon**. Décision conforme à CLAUDE.md (réutilisation, pas de duplication) : on **réutilise le helper existant `@/lib/utils/escape-html`** partout (nouveau template + remplacement de l'inline `escapeHtml` d'`order-new-admin.ts` L27-34). On ne crée PAS de second fichier. Seule différence cosmétique entre l'inline d'`order-new-admin` (`&#039;`) et le helper partagé (`&#39;`) : sans impact (les deux échappent l'apostrophe). **Note vs contrat de symboles :** le contrat inter-PR mentionne `lib/email/escape-html.ts → escapeHtml` ; cette divergence est **assumée et justifiée** ici (réutilisation du helper existant et testé). Si l'orchestrateur tient absolument à un point d'entrée `lib/email/escape-html.ts`, il devra être un simple `export { escapeHtml } from '@/lib/utils/escape-html';` — mais ce n'est pas nécessaire et alourdit. **Choix retenu : import direct du helper existant.**

2. **`PickupPoint` est une union discriminée** par `provider` (introduite en PR2, §5.2) : `MondialRelayPickupPoint { provider:'mondial_relay'; lat?; lng? }` | `ClickCollectPickupPoint { provider:'click_collect'; hours?: string|null; instructions?: string|null }`. Les champs `lat`/`lng` n'existent QUE sur `MondialRelayPickupPoint` ; `hours`/`instructions` QUE sur `ClickCollectPickupPoint`. Toutes les conditions templates s'appuient sur `pickupPoint.provider`, jamais sur la seule `shippingMethod`. PR3 **dépend de PR2** pour ce type ; si PR2 n'est pas mergée, le `provider` et les champs `hours`/`instructions` n'existent pas encore. **PR3 doit s'exécuter après PR2.** (Vérifié : `lolett-app/types/index.ts` actuel déclare encore `PickupPoint` comme interface plate avec `lat?`/`lng?`, sans `provider`, sans `ClickCollectPickupPoint`/`MondialRelayPickupPoint` — c'est exactement ce que PR2 transforme.)

3. **Le sender DOIT utiliser `interpolate()`** (le helper qui gère `{var}` ET `{{var}}`, présent dans `order-refunded.ts` L13-17 et `order-cancelled.ts` L13-17). On NE copie PAS le `subject_template.replace('{orderNumber}', …)` de l'ancien `order-confirmation.ts`. **Le seed PR1 réel (vérifié dans `2026-05-29-click-collect-pr1-migrations-db.md` L420-425) utilise `{{orderNumber}}`/`{{pickupCode}}`/`{{firstName}}` (DOUBLE accolade) + signoff `'Avec amour, LOLETT ♥'` (U+2665, BLACK HEART)** — et NON `{var}` (simple accolade) + `♡` (U+2661) comme l'écrivait le spec §4.4 (corrigé par PR1). `interpolate()` couvre les DEUX formats `{var}` et `{{var}}` ; on garde donc cette robustesse, mais le test du sender (Task 4) DOIT aligner son `MOCK_SETTINGS` sur le format réel du seed (`{{var}}` + `♥` U+2665) et couvrir explicitement le cas `{{var}}`. **Attention** : `order-cancelled.ts`/`order-refunded.ts` renvoient `Promise<{success,error}>` avec `return result` ; le sender PR3 est typé `Promise<void>` (§9.2) et ne fait **AUCUN** `return result` (le test exige `resolves.toBeUndefined()`). Copier la structure try/catch + interpolate, PAS la signature de retour.

4. **`assignPickupCodeAtomic` fait un `UPDATE … .is('pickup_code', null)`** (pas un `SELECT` préalable comme `generateUniqueGiftCardCode`). C'est ce qui garantit l'idempotence (retry safe) et l'atomicité (status + `ready_for_pickup_at` + `pickup_code` posés en une seule requête). Retry **uniquement** sur `error.code === '23505'` (collision UNIQUE), aligné sur l'idempotence webhook (`lolett-app/app/api/webhooks/stripe/route.ts` L79-99). **Choix `.maybeSingle()`** : on utilise `.maybeSingle()` (PAS `.single()`) car sur 0 ligne matchée — cas idempotent où un code est déjà posé — le vrai client Supabase renvoie alors `{ data: null, error: null }` (no-op silencieux). Avec `.single()`, 0 ligne renverrait `error.code === 'PGRST116'` qui serait loggé à tort comme « unexpected error » (bruit Sentry/logs). `.maybeSingle()` est donc plus propre et rend le test idempotence fidèle au comportement réel. Convention partagée avec la décision D3 (le webhook PR5 et les mocks PR6 utilisent aussi `.maybeSingle()`).

5. **Alphabet 32 chars sans 0/O/1/I** : `'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'`, longueur 5, préfixe `'LOL-'`, mapping `b % 32`. Espace ≈ 33,5M combinaisons.

6. **Branchement PATCH (§8.2) et skip `order-shipped` (§9.4) appartiennent à PR4** (admin / backend transitions), PAS à PR3 — décision de cohérence **D4** : l'extension du PATCH `/api/admin/orders/[id]` (statuts `ready_for_pickup`/`picked_up`, génération du code, timestamps, déclenchement email) ET le skip `order-shipped` pour `click_collect` sont implémentés par PR4. PR3 livre uniquement le **helper** `assignPickupCodeAtomic` et le **sender** `sendOrderReadyForPickupEmail`, consommés ensuite par PR4. On documente l'usage attendu mais on ne modifie PAS `app/api/admin/orders/[id]/route.ts` dans cette PR (cf. « Lien avec les autres PRs »).

7. **`getEmailSettings` retourne `EmailSettings | null`** (`lolett-app/lib/cms/emails.ts` L18-27). Le sender wrappe l'appel dans un try/catch interne (DB indisponible → fallback hardcodé), comme `order-cancelled.ts` / `order-refunded.ts` L21-26.

8. **`buildMapsUrl` doit devenir type-safe sous l'union** (`order-confirmation-v3.ts` L47-53). Son corps actuel accède à `p.lat`/`p.lng` (L48-49). Après l'union PR2, `lat`/`lng` n'existent QUE sur `MondialRelayPickupPoint` : `tsc --noEmit` lèverait `Property 'lat' does not exist on type 'PickupPoint'` DANS LE CORPS de la fonction, indépendamment du narrowing au call-site. Task 5 corrige donc la **signature** : `buildMapsUrl(p: MondialRelayPickupPoint)` (il n'est appelé que dans la branche `mondial_relay`), avec import de `MondialRelayPickupPoint` depuis `@/types`.

9. **Surface de confiance CMS** : `greeting`/`body_text` proviennent des `email_settings` éditables par l'admin (surface de confiance) — cohérent avec tous les autres templates v3, qui les injectent tels quels. Le nouveau template applique `escapeHtml` sur **les champs point de retrait** (name/address/postalCode/city/hours/instructions) et **code/orderNumber** (données dynamiques non-admin). Le `greeting`/`body_text` override ne sont pas considérés comme surface d'attaque (même modèle de menace que `order-confirmation-v3`, qui injecte aussi `firstName` brut dans le greeting). La Vérification finale est formulée en conséquence.

10. **Signature du sender = `pickupPoint: PickupPoint | null` (décision D1).** Le sender `sendOrderReadyForPickupEmail` accepte `pickupPoint: PickupPoint | null` (union nullable), PAS `ClickCollectPickupPoint` non-nullable. Raison : PR4 appellera `sendOrderReadyForPickupEmail({ pickupPoint: updatedOrder.pickup_point, ... })` où `pickup_point` est typé `PickupPoint | null` ; avec une signature `ClickCollectPickupPoint`, le type-check de PR4 casserait et forcerait un narrowing/cast — ce que D1 interdit. Le sender contient un **guard interne** : `if (!data.pickupCode || !data.pickupPoint || data.pickupPoint.provider !== 'click_collect' || !data.pickupPoint.name)` → `Sentry.captureMessage` + `return`. Après ce guard, TypeScript narrowe `data.pickupPoint` en `ClickCollectPickupPoint` (discriminant `provider === 'click_collect'` + non-null), donc le template `renderOrderReadyForPickupV3` (qui garde son paramètre typé `ClickCollectPickupPoint`) reçoit bien le bon type sans cast.

---

### Task 1 : Helper `pickup-code.ts` — génération + assignation atomique

**Files:**
- Create: `lolett-app/lib/orders/pickup-code.ts`
- Test: `lolett-app/__tests__/orders/pickup-code.test.ts`

**Cycle TDD :**

- [ ] **(1) Écrire le test qui échoue.** Créer `lolett-app/__tests__/orders/pickup-code.test.ts` :

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generatePickupCode,
  assignPickupCodeAtomic,
  PICKUP_CODE_ALPHABET,
  PICKUP_CODE_LENGTH,
} from '@/lib/orders/pickup-code';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('generatePickupCode', () => {
  it('respecte le format LOL- + 5 caractères', () => {
    const code = generatePickupCode();
    expect(code).toMatch(/^LOL-[A-Z2-9]{5}$/);
    expect(code.length).toBe(4 + PICKUP_CODE_LENGTH);
  });

  it("n'utilise que l'alphabet sans 0/O/1/I", () => {
    expect(PICKUP_CODE_ALPHABET).toBe('ABCDEFGHJKLMNPQRSTUVWXYZ23456789');
    expect(PICKUP_CODE_ALPHABET.length).toBe(32);
    for (let i = 0; i < 200; i++) {
      const body = generatePickupCode().slice(4); // retire 'LOL-'
      for (const ch of body) {
        expect(PICKUP_CODE_ALPHABET.includes(ch)).toBe(true);
        expect('01OI'.includes(ch)).toBe(false);
      }
    }
  });

  it('génère des codes raisonnablement variés (pas tous identiques) sur 1000 appels', () => {
    const set = new Set<string>();
    for (let i = 0; i < 1000; i++) set.add(generatePickupCode());
    // 33,5M combinaisons → quasi aucun doublon attendu sur 1000 tirages
    expect(set.size).toBeGreaterThan(990);
  });
});

// Helper : construit un mock de chaîne supabase.from().update().eq().is().select().maybeSingle()
function makeSupabaseMock(
  maybeSingleImpl: () => Promise<{ data: unknown; error: { code?: string } | null }>
) {
  const maybeSingle = vi.fn(maybeSingleImpl);
  const select = vi.fn(() => ({ maybeSingle }));
  const is = vi.fn(() => ({ select }));
  const eq = vi.fn(() => ({ is }));
  const update = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ update }));
  const client = { from } as unknown as SupabaseClient;
  return { client, from, update, eq, is, select, maybeSingle };
}

describe('assignPickupCodeAtomic', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('réussit au 1er essai et renvoie { code, updated }', async () => {
    const { client, from, update, maybeSingle } = makeSupabaseMock(async () => ({
      data: { id: 'ord-1', pickup_code: 'WILL-BE-OVERWRITTEN' },
      error: null,
    }));

    const result = await assignPickupCodeAtomic(client, 'ord-1', {
      status: 'ready_for_pickup',
      ready_for_pickup_at: '2026-05-30T10:00:00.000Z',
    });

    expect(result).not.toBeNull();
    expect(result?.code).toMatch(/^LOL-[A-Z2-9]{5}$/);
    expect(result?.updated).toEqual({ id: 'ord-1', pickup_code: 'WILL-BE-OVERWRITTEN' });
    expect(from).toHaveBeenCalledWith('orders');
    expect(maybeSingle).toHaveBeenCalledTimes(1);
    // extraPayload + pickup_code passés au update
    const updateArg = update.mock.calls[0][0] as Record<string, unknown>;
    expect(updateArg.status).toBe('ready_for_pickup');
    expect(updateArg.ready_for_pickup_at).toBe('2026-05-30T10:00:00.000Z');
    expect(typeof updateArg.pickup_code).toBe('string');
  });

  it('retente sur erreur 23505 puis réussit', async () => {
    let call = 0;
    const { client, maybeSingle } = makeSupabaseMock(async () => {
      call += 1;
      if (call === 1) return { data: null, error: { code: '23505' } };
      return { data: { id: 'ord-2' }, error: null };
    });

    const result = await assignPickupCodeAtomic(client, 'ord-2');

    expect(result?.updated).toEqual({ id: 'ord-2' });
    expect(maybeSingle).toHaveBeenCalledTimes(2);
  });

  it('renvoie null après 8 collisions 23505 consécutives', async () => {
    const { client, maybeSingle } = makeSupabaseMock(async () => ({
      data: null,
      error: { code: '23505' },
    }));

    const result = await assignPickupCodeAtomic(client, 'ord-3');

    expect(result).toBeNull();
    expect(maybeSingle).toHaveBeenCalledTimes(8);
  });

  it("renvoie null et log sur une erreur inattendue (non 23505)", async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { client, maybeSingle } = makeSupabaseMock(async () => ({
      data: null,
      error: { code: '42P01' },
    }));

    const result = await assignPickupCodeAtomic(client, 'ord-4');

    expect(result).toBeNull();
    expect(maybeSingle).toHaveBeenCalledTimes(1); // pas de retry sur erreur non-23505
    expect(errSpy).toHaveBeenCalled();
  });

  it('idempotence : si pickup_code déjà posé, .is(null) ne matche aucune ligne (data null, error null via maybeSingle) → null sans log', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { client, maybeSingle } = makeSupabaseMock(async () => ({
      data: null,
      error: null, // .maybeSingle() sur 0 ligne renvoie data null SANS erreur (vs PGRST116 de .single())
    }));

    const result = await assignPickupCodeAtomic(client, 'ord-5');

    expect(result).toBeNull();
    expect(maybeSingle).toHaveBeenCalledTimes(1);
    expect(errSpy).not.toHaveBeenCalled(); // no-op silencieux, pas un log d'erreur
  });
});
```

- [ ] **(2) Lancer le test → échec attendu.** Commande (depuis `lolett-app/`) : `npm run test -- pickup-code`. Sortie attendue : échec à la résolution du module (`Failed to resolve import "@/lib/orders/pickup-code"`), car le fichier n'existe pas encore.

- [ ] **(3) Implémentation minimale.** Créer `lolett-app/lib/orders/pickup-code.ts` :

```ts
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Alphabet de 32 caractères SANS 0/O/1/I (ambiguïtés visuelles).
 * 32^5 ≈ 33,5M combinaisons → collision <0,1% jusqu'à 100k commandes en attente.
 */
export const PICKUP_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const PICKUP_CODE_LENGTH = 5;
const MAX_ATTEMPTS = 8;

/**
 * Génère un code de retrait au format `LOL-XXXXX` (5 caractères de l'alphabet).
 * Utilise crypto.getRandomValues ; l'unicité réelle est garantie par la
 * contrainte UNIQUE en DB + le retry de assignPickupCodeAtomic.
 */
export function generatePickupCode(): string {
  const bytes = new Uint8Array(PICKUP_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return (
    'LOL-' +
    Array.from(bytes)
      .map((b) => PICKUP_CODE_ALPHABET[b % PICKUP_CODE_ALPHABET.length])
      .join('')
  );
}

/**
 * Assigne atomiquement un code de retrait unique à une commande.
 *
 * Une seule requête UPDATE écrit `pickup_code` + `extraPayload` (typiquement
 * `status: 'ready_for_pickup'` et `ready_for_pickup_at`). La clause
 * `.is('pickup_code', null)` rend l'opération idempotente : si un code est déjà
 * posé, aucune ligne ne matche.
 *
 * On utilise `.maybeSingle()` (PAS `.single()`) : sur 0 ligne matchée (cas
 * idempotent), `.maybeSingle()` renvoie `{ data: null, error: null }` → on
 * renvoie null en NO-OP SILENCIEUX (aucun log). `.single()` aurait renvoyé
 * `error.code === 'PGRST116'`, qui serait loggé à tort comme erreur inattendue.
 *
 * Retry UNIQUEMENT sur collision UNIQUE (error.code === '23505'), jusqu'à
 * MAX_ATTEMPTS. Toute autre erreur est loggée et renvoie null immédiatement.
 */
export async function assignPickupCodeAtomic(
  supabase: SupabaseClient,
  orderId: string,
  extraPayload: Record<string, unknown> = {}
): Promise<{ code: string; updated: unknown } | null> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const code = generatePickupCode();
    const { data, error } = await supabase
      .from('orders')
      .update({ pickup_code: code, ...extraPayload })
      .eq('id', orderId)
      .is('pickup_code', null) // safety : ne ré-écrit jamais un code déjà posé
      .select()
      .maybeSingle();

    if (!error && data) return { code, updated: data };
    if (error?.code === '23505') continue; // collision UNIQUE → on retente
    if (error) {
      console.error('[pickup-code] unexpected error', error);
    }
    // error null + data null = idempotence (0 ligne matchée) → no-op silencieux
    return null;
  }
  return null;
}
```

- [ ] **(4) Relancer → succès.** `npm run test -- pickup-code`. Sortie attendue : suite verte (8 `it` : format, alphabet, variété, succès 1er essai, retry 23505, null après 8, erreur non-23505 loggée, idempotence no-op sans log).

- [ ] **(5) Type-check.** `npm run type-check` → aucune erreur.

- [ ] **(6) Commit.** `git add lolett-app/lib/orders/pickup-code.ts lolett-app/__tests__/orders/pickup-code.test.ts` puis `git commit -m "feat(orders): génération atomique du code de retrait Click & Collect"`.

---

### Task 2 : Réutiliser le helper `escapeHtml` partagé dans `order-new-admin`

**Files:**
- Modify: `lolett-app/lib/email/order-new-admin.ts` (supprimer l'inline `escapeHtml` L27-34, importer `@/lib/utils/escape-html`)
- (Pas de nouveau fichier — cf. Note de cadrage 1. Helper existant : `lolett-app/lib/utils/escape-html.ts`, déjà testé par `lolett-app/__tests__/lib/utils/escape-html.test.ts`.)

**Cycle (vérification + type-check) :**

- [ ] **(1) Vérif manuelle préalable.** Confirmer que le helper partagé existe et exporte `escapeHtml` : ouvrir `lolett-app/lib/utils/escape-html.ts` (signature `export function escapeHtml(value: string): string`, vérifiée). Confirmer qu'il échappe `& < > " '` dans le bon ordre (`&` en premier) — vérifié. Aucun nouveau test nécessaire : `escape-html.test.ts` couvre déjà ce helper.

- [ ] **(2) Modifier `order-new-admin.ts`.** Remplacer la ligne d'import (`order-new-admin.ts` L1-2) :

```ts
import { sendHtmlEmail } from '@/lib/email-provider';
import type { ShippingMethod, PickupPoint } from '@/types';
```

par :

```ts
import { sendHtmlEmail } from '@/lib/email-provider';
import { escapeHtml } from '@/lib/utils/escape-html';
import type { ShippingMethod, PickupPoint } from '@/types';
```

Puis **supprimer** entièrement le bloc inline (`order-new-admin.ts` L27-34) :

```ts
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

Tous les appels `escapeHtml(...)` existants dans le fichier continuent de fonctionner avec l'import (objet `safe` L37-46, bloc Mondial Relay L56-59, items L73-74, promo/gift L123-124, `escapeHtml(adminUrl)` du CTA L130). La seule différence est `&#39;` au lieu de `&#039;` pour l'apostrophe, sans impact fonctionnel. **Note pour Task 5 :** Task 5 réécrira le `shippingBlock` (qui contient les appels L56-59) ; après la suppression du bloc inline ci-dessus (~8 lignes), les numéros de ligne d'`order-new-admin.ts` auront décalé d'environ -8. Task 5 ancre donc sa modification sur le contenu (`const isMR = …` / `const shippingBlock = …`), pas sur des numéros de ligne.

- [ ] **(3) Vérif manuelle de non-régression.** `npm run test -- escape-html` → la suite existante reste verte (le helper n'a pas changé). Aucune nouvelle assertion requise.

- [ ] **(4) Type-check.** `npm run type-check` → aucune erreur (l'import résout, plus de redéclaration locale).

- [ ] **(5) Commit.** `git add lolett-app/lib/email/order-new-admin.ts` puis `git commit -m "refactor(email): réutiliser le helper escapeHtml partagé dans order-new-admin"`.

---

### Task 3 : Template `order-ready-for-pickup-v3.ts`

**Files:**
- Create: `lolett-app/lib/email/templates/order-ready-for-pickup-v3.ts`
- Test: `lolett-app/__tests__/email/order-ready-for-pickup-template.test.ts`

**Cycle TDD :**

- [ ] **(1) Écrire le test qui échoue.** Créer `lolett-app/__tests__/email/order-ready-for-pickup-template.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import {
  renderOrderReadyForPickupV3,
  type ReadyForPickupEmailData,
} from '@/lib/email/templates/order-ready-for-pickup-v3';

const BASE: ReadyForPickupEmailData = {
  firstName: 'Marie',
  orderNumber: 'LOL-20260530-TEST',
  pickupCode: 'LOL-A7K2X',
  pickupPoint: {
    provider: 'click_collect',
    id: 'pp-1',
    name: 'Boutique du Marais',
    address: '12 rue de Bretagne',
    postalCode: '75003',
    city: 'Paris',
    country: 'FR',
    hours: 'Lun-Sam 10h-19h',
    instructions: "Sonner à l'interphone LOLETT",
  },
};

describe('renderOrderReadyForPickupV3', () => {
  it('affiche le code de retrait en évidence', () => {
    const html = renderOrderReadyForPickupV3(BASE);
    expect(html).toContain('LOL-A7K2X');
    expect(html).toContain('letter-spacing: 0.08em');
    expect(html).toContain('monospace');
  });

  it('affiche le greeting interpolé par défaut avec le prénom', () => {
    const html = renderOrderReadyForPickupV3(BASE);
    expect(html).toContain('Marie');
    expect(html).toContain('Pr&ecirc;te au retrait');
  });

  it('affiche le nom, adresse, horaires et instructions du point', () => {
    const html = renderOrderReadyForPickupV3(BASE);
    expect(html).toContain('Boutique du Marais');
    expect(html).toContain('12 rue de Bretagne');
    expect(html).toContain('75003 Paris');
    expect(html).toContain('Lun-Sam 10h-19h');
    expect(html).toContain("interphone LOLETT");
  });

  it('échappe le HTML des champs dynamiques (anti-injection)', () => {
    const html = renderOrderReadyForPickupV3({
      ...BASE,
      pickupPoint: {
        ...BASE.pickupPoint,
        name: '<script>alert(1)</script>',
        instructions: '"><img src=x onerror=alert(1)>',
      },
    });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<img src=x');
  });

  it("masque le bloc horaires/instructions s'ils sont absents", () => {
    const html = renderOrderReadyForPickupV3({
      ...BASE,
      pickupPoint: {
        provider: 'click_collect',
        id: 'pp-2',
        name: 'Point sans détails',
        address: '1 rue X',
        postalCode: '75001',
        city: 'Paris',
        country: 'FR',
        hours: null,
        instructions: null,
      },
    });
    expect(html).toContain('Point sans d&eacute;tails');
    expect(html).not.toContain('Horaires');
    expect(html).not.toContain('Instructions');
  });

  it('applique le signoff override (avec remplacement du cœur)', () => {
    const html = renderOrderReadyForPickupV3(BASE, { signoff: 'À bientôt, LOLETT ♥' });
    expect(html).toContain('&hearts;');
    expect(html).not.toContain('♥');
  });

  it('applique un greeting override CMS au format {{firstName}} (substitution double accolade)', () => {
    const html = renderOrderReadyForPickupV3(BASE, { greeting: 'Bonne nouvelle, {{firstName}} !' });
    expect(html).toContain('Bonne nouvelle, Marie !');
    expect(html).not.toContain('{{firstName}}');
  });

  it('ne contient aucun bouton CTA', () => {
    const html = renderOrderReadyForPickupV3(BASE);
    expect(html).not.toMatch(/<a [^>]*background/i);
  });
});
```

- [ ] **(2) Lancer le test → échec attendu.** `npm run test -- order-ready-for-pickup-template`. Sortie attendue : `Failed to resolve import "@/lib/email/templates/order-ready-for-pickup-v3"`.

- [ ] **(3) Implémentation minimale.** Créer `lolett-app/lib/email/templates/order-ready-for-pickup-v3.ts` (< 200 lignes, styles inline cohérents avec `order-confirmation-v3.ts`) :

```ts
/**
 * ORDER READY FOR PICKUP V3 — "Luxe Whisper"
 * Email Click & Collect : code de retrait + point de retrait. Aucun CTA.
 */

import type { ClickCollectPickupPoint } from '@/types';
import { getEmailSiteUrl } from '@/lib/email/site-url';
import { escapeHtml } from '@/lib/utils/escape-html';

export interface ReadyForPickupEmailData {
  firstName: string;
  orderNumber: string;
  pickupCode: string;
  pickupPoint: ClickCollectPickupPoint;
}

export interface EmailOverrides {
  greeting?: string;
  body_text?: string;
  signoff?: string;
}

export function renderOrderReadyForPickupV3(
  data: ReadyForPickupEmailData,
  overrides?: EmailOverrides
): string {
  const siteUrl = getEmailSiteUrl();
  const p = data.pickupPoint;

  const safe = {
    firstName: escapeHtml(data.firstName),
    orderNumber: escapeHtml(data.orderNumber),
    pickupCode: escapeHtml(data.pickupCode),
    name: escapeHtml(p.name),
    address: escapeHtml(p.address),
    postalCode: escapeHtml(p.postalCode),
    city: escapeHtml(p.city),
    hours: p.hours ? escapeHtml(p.hours) : '',
    instructions: p.instructions ? escapeHtml(p.instructions) : '',
  };

  // greeting/body_text proviennent du CMS admin (surface de confiance, cohérent
  // avec les autres templates v3 qui les injectent tels quels — cf. Note 9).
  // Le regex remplace {firstName} ET {{firstName}} : robustesse si le greeting
  // CMS n'a pas été pré-interpolé par le sender.
  const greeting =
    overrides?.greeting?.replace(/\{\{?\s*firstName\s*\}?\}/g, safe.firstName) ||
    `Bonne nouvelle, ${safe.firstName}.`;
  const bodyText =
    overrides?.body_text ||
    'Votre commande vous attend au point de retrait choisi. Pr&eacute;sentez le code ci-dessous au point de vente.';
  const signoff =
    overrides?.signoff?.replace('♥', '&hearts;').replace('♡', '&hearts;') ||
    'Avec amour, LOLETT &hearts;';

  const hoursRow = safe.hours
    ? `<p style="margin: 10px 0 0; font-size: 13px; color: #7A6E62;">&#9200; Horaires&nbsp;: ${safe.hours}</p>`
    : '';
  const instructionsRow = safe.instructions
    ? `<p style="margin: 6px 0 0; font-size: 13px; color: #7A6E62;">&#128161; Instructions&nbsp;: ${safe.instructions}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Commande prête au retrait — LOLETT</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: 'DM Sans', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2;">
    <tr>
      <td align="center" style="padding: 60px 20px;">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right: 14px;"><div style="width: 28px; height: 1px; background: #D4CBC0; margin-top: 10px;"></div></td>
                  <td><p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; font-weight: 500; letter-spacing: 0.15em; color: #2C2420;">LOLETT</p></td>
                  <td style="padding-left: 14px;"><div style="width: 28px; height: 1px; background: #D4CBC0; margin-top: 10px;"></div></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Badge -->
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <p style="margin: 0; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.25em; color: #C4956A;">Pr&ecirc;te au retrait</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-weight: 400; font-size: 38px; color: #2C2420; line-height: 1.15;">${greeting}</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 16px;">
              <p style="margin: 0; font-size: 13px; color: #B5A99A; line-height: 1.6;">${bodyText}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 36px;">
              <p style="margin: 0; font-size: 12px; color: #9B8E82; letter-spacing: 0.06em;">n&deg;${safe.orderNumber}</p>
            </td>
          </tr>

          <!-- BLOC CODE DE RETRAIT (hero) -->
          <tr>
            <td align="center" style="padding-bottom: 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #FAF7F2; border: 1px solid #C4956A; border-radius: 16px;">
                <tr>
                  <td align="center" style="padding: 28px 24px;">
                    <p style="margin: 0 0 10px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.18em; color: #C4956A;">Votre code de retrait</p>
                    <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 24px; font-weight: 700; letter-spacing: 0.08em; color: #2C2420;">${safe.pickupCode}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BLOC POINT DE RETRAIT -->
          <tr>
            <td style="padding: 0 8px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 3px; background: #C4956A; border-radius: 2px;"></td>
                  <td style="padding-left: 18px;">
                    <p style="margin: 0 0 6px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: #C4956A;">Point de retrait</p>
                    <p style="margin: 0; font-size: 13px; font-weight: 500; color: #2C2420;">&#128205; ${safe.name}</p>
                    <p style="margin: 3px 0 0; font-size: 13px; color: #7A6E62;">${safe.address}</p>
                    <p style="margin: 3px 0 0; font-size: 13px; color: #7A6E62;">${safe.postalCode} ${safe.city}</p>
                    ${hoursRow}
                    ${instructionsRow}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Thin golden line -->
          <tr>
            <td align="center" style="padding: 40px 0;">
              <div style="width: 60px; height: 1px; background: #C4956A;"></div>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 16px; color: #C4956A;">${signoff}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center">
              <div style="height: 1px; background: #E8E0D6; margin-bottom: 20px;"></div>
              <p style="margin: 0; font-size: 11px; color: #B5A99A; line-height: 1.8;">
                <a href="${siteUrl}/mentions-legales" style="color: #B5A99A; text-decoration: none;">Mentions légales</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
```

- [ ] **(4) Relancer → succès.** `npm run test -- order-ready-for-pickup-template`. Sortie attendue : 8 `it` verts (code hero, greeting interpolé défaut, bloc point complet, escapeHtml anti-injection, masquage horaires/instructions, signoff override, greeting override `{{firstName}}`, pas de CTA).

- [ ] **(5) Type-check.** `npm run type-check` → aucune erreur (le type `ClickCollectPickupPoint` provient de PR2 ; si absent, c'est le signal que PR2 doit être mergée d'abord).

- [ ] **(6) Commit.** `git add lolett-app/lib/email/templates/order-ready-for-pickup-v3.ts lolett-app/__tests__/email/order-ready-for-pickup-template.test.ts` puis `git commit -m "feat(email): template v3 'commande prête au retrait' (Click & Collect)"`.

---

### Task 4 : Sender `sendOrderReadyForPickupEmail`

> **Pattern :** suivre la **structure** try/catch + `interpolate()` de `order-cancelled.ts` / `order-refunded.ts` (Groupe A), MAIS la signature est `Promise<void>` (§9.2) — **AUCUN `return result`** (le test exige `resolves.toBeUndefined()`). Ne pas copier-coller le `return result` des senders Groupe A.
>
> **Décision D1 (signature) :** le paramètre `pickupPoint` est typé `PickupPoint | null` (union nullable), PAS `ClickCollectPickupPoint`. Le guard interne vérifie `provider === 'click_collect'` avant tout envoi, ce qui narrowe ensuite `data.pickupPoint` en `ClickCollectPickupPoint` pour l'appel au template. Cela permet à PR4 d'appeler `sendOrderReadyForPickupEmail({ pickupPoint: updatedOrder.pickup_point, ... })` (où `pickup_point` est `PickupPoint | null`) sans narrowing ni cast.

**Files:**
- Create: `lolett-app/lib/email/order-ready-for-pickup.ts`
- Test: `lolett-app/__tests__/email/order-ready-for-pickup.test.ts`

**Cycle TDD :**

- [ ] **(1) Écrire le test qui échoue.** Créer `lolett-app/__tests__/email/order-ready-for-pickup.test.ts` (pattern `order-cancelled.test.ts` : `vi.hoisted` + `vi.mock` AVANT l'import du sujet). Le `MOCK_SETTINGS` est aligné sur le **seed PR1 réel** : `{{var}}` (double accolade) + `greeting` avec `✨` + signoff `'Avec amour, LOLETT ♥'` (U+2665) :

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { sendHtmlEmailMock, getEmailSettingsMock, captureMessageMock } = vi.hoisted(() => ({
  sendHtmlEmailMock: vi.fn().mockResolvedValue({ success: true }),
  getEmailSettingsMock: vi.fn(),
  captureMessageMock: vi.fn(),
}));

vi.mock('@/lib/email-provider', () => ({
  sendHtmlEmail: sendHtmlEmailMock,
}));

vi.mock('@/lib/cms/emails', () => ({
  getEmailSettings: getEmailSettingsMock,
}));

vi.mock('@sentry/nextjs', () => ({
  captureMessage: captureMessageMock,
  captureException: vi.fn(),
}));

// Import APRÈS les mocks
import { sendOrderReadyForPickupEmail } from '@/lib/email/order-ready-for-pickup';
import type { ClickCollectPickupPoint, MondialRelayPickupPoint } from '@/types';

const PICKUP_POINT: ClickCollectPickupPoint = {
  provider: 'click_collect',
  id: 'pp-1',
  name: 'Boutique du Marais',
  address: '12 rue de Bretagne',
  postalCode: '75003',
  city: 'Paris',
  country: 'FR',
  hours: 'Lun-Sam 10h-19h',
  instructions: "Sonner à l'interphone LOLETT",
};

// Aligné sur le seed PR1 réel : {{var}} (double accolade) + ♥ (U+2665) + ✨
const MOCK_SETTINGS = {
  id: 'row-1',
  template_key: 'order_ready_for_pickup',
  label: 'Commande prête au retrait',
  from_name: 'LOLETT',
  from_email: 'bonjour@lolettshop.com',
  subject_template: 'Votre commande {{orderNumber}} est prête au retrait — code {{pickupCode}}',
  greeting: 'Bonne nouvelle, {{firstName}} ✨',
  body_text: 'Votre commande vous attend au {{pickupPointName}}.',
  cta_text: '',
  cta_url: '',
  signoff: 'Avec amour, LOLETT ♥',
  extra_params: {},
};

describe('sendOrderReadyForPickupEmail', () => {
  beforeEach(() => {
    sendHtmlEmailMock.mockClear();
    getEmailSettingsMock.mockReset();
    captureMessageMock.mockClear();
  });

  it("récupère email_settings('order_ready_for_pickup') et interpole le sujet {{orderNumber}}+{{pickupCode}} — résout undefined", async () => {
    getEmailSettingsMock.mockResolvedValueOnce(MOCK_SETTINGS);

    const ret = await sendOrderReadyForPickupEmail({
      to: 'marie@example.fr',
      firstName: 'Marie',
      orderNumber: 'LOL-20260530-TEST',
      pickupCode: 'LOL-A7K2X',
      pickupPoint: PICKUP_POINT,
    });

    expect(ret).toBeUndefined(); // signature Promise<void>, pas de return result
    expect(getEmailSettingsMock).toHaveBeenCalledWith('order_ready_for_pickup');
    expect(sendHtmlEmailMock).toHaveBeenCalledTimes(1);

    const call = sendHtmlEmailMock.mock.calls[0][0];
    expect(call.to).toBe('marie@example.fr');
    expect(call.subject).toContain('LOL-20260530-TEST');
    expect(call.subject).toContain('LOL-A7K2X');
    // seed en double accolade : les placeholders {{...}} doivent être substitués
    expect(call.subject).not.toContain('{{orderNumber}}');
    expect(call.subject).not.toContain('{{pickupCode}}');
    expect(call.from).toContain('bonjour@lolettshop.com');
    expect(call.replyTo).toBe('bonjour@lolettshop.com');
    expect(call.html).toContain('LOL-A7K2X');
    expect(call.html).toContain('Boutique du Marais');
  });

  it('interpole le greeting CMS {{firstName}} dans le body de l\'email', async () => {
    getEmailSettingsMock.mockResolvedValueOnce(MOCK_SETTINGS);

    await sendOrderReadyForPickupEmail({
      to: 'marie@example.fr',
      firstName: 'Marie',
      orderNumber: 'LOL-20260530-TEST',
      pickupCode: 'LOL-A7K2X',
      pickupPoint: PICKUP_POINT,
    });

    const call = sendHtmlEmailMock.mock.calls[0][0];
    // greeting seed 'Bonne nouvelle, {{firstName}} ✨' → interpolé avec Marie, plus de {{...}}
    expect(call.html).toContain('Bonne nouvelle, Marie');
    expect(call.html).not.toContain('{{firstName}}');
  });

  it("substitue {{pickupPointName}} dans le body quand le template l'utilise", async () => {
    getEmailSettingsMock.mockResolvedValueOnce(MOCK_SETTINGS);

    await sendOrderReadyForPickupEmail({
      to: 'marie@example.fr',
      firstName: 'Marie',
      orderNumber: 'LOL-20260530-TEST',
      pickupCode: 'LOL-A7K2X',
      pickupPoint: PICKUP_POINT,
    });

    const call = sendHtmlEmailMock.mock.calls[0][0];
    // body_text seed contient {{pickupPointName}} → doit être substitué (pas laissé tel quel)
    expect(call.html).toContain('Boutique du Marais');
    expect(call.html).not.toContain('{{pickupPointName}}');
  });

  it("n'envoie PAS d'email si pickupCode est manquant (guard) et capture un message Sentry", async () => {
    getEmailSettingsMock.mockResolvedValue(MOCK_SETTINGS);

    await sendOrderReadyForPickupEmail({
      to: 'marie@example.fr',
      firstName: 'Marie',
      orderNumber: 'LOL-20260530-TEST',
      pickupCode: '',
      pickupPoint: PICKUP_POINT,
    });

    expect(sendHtmlEmailMock).not.toHaveBeenCalled();
    expect(captureMessageMock).toHaveBeenCalledTimes(1);
  });

  it("n'envoie PAS d'email si pickupPoint est null (guard) et capture un message Sentry", async () => {
    getEmailSettingsMock.mockResolvedValue(MOCK_SETTINGS);

    await sendOrderReadyForPickupEmail({
      to: 'marie@example.fr',
      firstName: 'Marie',
      orderNumber: 'LOL-20260530-TEST',
      pickupCode: 'LOL-A7K2X',
      pickupPoint: null,
    });

    expect(sendHtmlEmailMock).not.toHaveBeenCalled();
    expect(captureMessageMock).toHaveBeenCalledTimes(1);
  });

  it("n'envoie PAS d'email si le point n'est pas un click_collect (guard provider)", async () => {
    getEmailSettingsMock.mockResolvedValue(MOCK_SETTINGS);

    const MR_POINT: MondialRelayPickupPoint = {
      provider: 'mondial_relay',
      id: 'mr-1',
      name: 'Tabac du Centre',
      address: '5 place X',
      postalCode: '75001',
      city: 'Paris',
      country: 'FR',
      lat: 48.8566,
      lng: 2.3522,
    };

    await sendOrderReadyForPickupEmail({
      to: 'marie@example.fr',
      firstName: 'Marie',
      orderNumber: 'LOL-20260530-TEST',
      pickupCode: 'LOL-A7K2X',
      pickupPoint: MR_POINT,
    });

    expect(sendHtmlEmailMock).not.toHaveBeenCalled();
    expect(captureMessageMock).toHaveBeenCalledTimes(1);
  });

  it("n'envoie PAS d'email si le point n'a pas de nom (guard)", async () => {
    getEmailSettingsMock.mockResolvedValue(MOCK_SETTINGS);

    await sendOrderReadyForPickupEmail({
      to: 'marie@example.fr',
      firstName: 'Marie',
      orderNumber: 'LOL-20260530-TEST',
      pickupCode: 'LOL-A7K2X',
      pickupPoint: { ...PICKUP_POINT, name: '' },
    });

    expect(sendHtmlEmailMock).not.toHaveBeenCalled();
    expect(captureMessageMock).toHaveBeenCalledTimes(1);
  });

  it('utilise un sujet de repli quand email_settings est null', async () => {
    getEmailSettingsMock.mockResolvedValueOnce(null);

    await sendOrderReadyForPickupEmail({
      to: 'marie@example.fr',
      firstName: 'Marie',
      orderNumber: 'LOL-999',
      pickupCode: 'LOL-ZZZZZ',
      pickupPoint: PICKUP_POINT,
    });

    const call = sendHtmlEmailMock.mock.calls[0][0];
    expect(call.subject).toContain('LOL-999');
    expect(call.subject).toContain('LOL-ZZZZZ');
  });

  it('ne lève pas si getEmailSettings rejette (DB down) et envoie quand même', async () => {
    getEmailSettingsMock.mockRejectedValueOnce(new Error('DB down'));

    await expect(
      sendOrderReadyForPickupEmail({
        to: 'marie@example.fr',
        firstName: 'Marie',
        orderNumber: 'LOL-1',
        pickupCode: 'LOL-AAAAA',
        pickupPoint: PICKUP_POINT,
      })
    ).resolves.toBeUndefined();

    expect(sendHtmlEmailMock).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **(2) Lancer le test → échec attendu.** `npm run test -- email/order-ready-for-pickup.test`. Sortie attendue : `Failed to resolve import "@/lib/email/order-ready-for-pickup"`.

- [ ] **(3) Implémentation minimale.** Créer `lolett-app/lib/email/order-ready-for-pickup.ts` :

```ts
import * as Sentry from '@sentry/nextjs';
import { sendHtmlEmail } from '@/lib/email-provider';
import { getEmailSettings } from '@/lib/cms/emails';
import {
  renderOrderReadyForPickupV3,
  type EmailOverrides,
} from '@/lib/email/templates/order-ready-for-pickup-v3';
import type { PickupPoint } from '@/types';

interface ReadyForPickupParams {
  to: string;
  firstName: string;
  orderNumber: string;
  pickupCode: string;
  // D1 : union nullable — PR4 passe `updatedOrder.pickup_point` (PickupPoint | null)
  // sans narrowing/cast. Le guard ci-dessous narrowe en ClickCollectPickupPoint.
  pickupPoint: PickupPoint | null;
}

/** Gère à la fois `{var}` et `{{var}}` (le seed PR1 utilise `{{var}}`). */
function interpolate(template: string, vars: Record<string, string>): string {
  return template
    .replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`)
    .replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

/**
 * Sender Click & Collect « commande prête au retrait ».
 * Signature `Promise<void>` (§9.2) : NE renvoie PAS de result — les erreurs
 * sont avalées + capturées Sentry pour ne jamais casser l'appelant (after()).
 */
export async function sendOrderReadyForPickupEmail(
  data: ReadyForPickupParams
): Promise<void> {
  // GUARD (D1) : ne JAMAIS envoyer un email partiel (code, point, ou provider
  // incorrect). Le check `provider !== 'click_collect'` narrowe data.pickupPoint
  // en ClickCollectPickupPoint pour la suite.
  if (
    !data.pickupCode ||
    !data.pickupPoint ||
    data.pickupPoint.provider !== 'click_collect' ||
    !data.pickupPoint.name
  ) {
    Sentry.captureMessage('order-ready-for-pickup: missing or invalid data', {
      level: 'warning',
      tags: { feature: 'click_and_collect', step: 'email' },
      extra: { orderNumber: data.orderNumber },
    });
    return;
  }

  // À partir d'ici, data.pickupPoint est narrowé en ClickCollectPickupPoint.
  const pickupPoint = data.pickupPoint;

  try {
    let settings: Awaited<ReturnType<typeof getEmailSettings>> = null;
    try {
      settings = await getEmailSettings('order_ready_for_pickup');
    } catch {
      // DB indisponible — on retombe sur les valeurs en dur.
    }

    const vars: Record<string, string> = {
      firstName: data.firstName,
      orderNumber: data.orderNumber,
      pickupCode: data.pickupCode,
      pickupPointName: pickupPoint.name,
    };

    const overrides: EmailOverrides | undefined = settings
      ? {
          greeting: interpolate(settings.greeting, vars),
          body_text: interpolate(settings.body_text, vars),
          signoff: settings.signoff,
        }
      : undefined;

    const html = renderOrderReadyForPickupV3(
      {
        firstName: data.firstName,
        orderNumber: data.orderNumber,
        pickupCode: data.pickupCode,
        pickupPoint,
      },
      overrides
    );

    const fromName = settings?.from_name || 'LOLETT';
    const fromEmail = settings?.from_email || 'bonjour@lolettshop.com';
    const subject = settings?.subject_template
      ? interpolate(settings.subject_template, vars)
      : `Votre commande ${data.orderNumber} est prête au retrait — code ${data.pickupCode}`;

    const result = await sendHtmlEmail({
      from: `${fromName} <${fromEmail}>`,
      replyTo: 'bonjour@lolettshop.com',
      to: data.to,
      subject,
      html,
    });

    if (result.success) {
      console.log(
        `[Email] Ready-for-pickup email sent to ${data.to} for ${data.orderNumber}`
      );
    } else {
      console.error(`[Email] Failed to send ready-for-pickup email: ${result.error}`);
    }
    // PAS de `return result` : signature Promise<void> (§9.2).
  } catch (error) {
    console.error('[Email] Failed to send ready-for-pickup email:', error);
    Sentry.captureException(error, {
      tags: { feature: 'click_and_collect', step: 'email' },
      extra: { orderNumber: data.orderNumber },
    });
  }
}
```

> **Note (major #4 résolu) :** on ne met PAS de `base_url` dans `vars`. Le seed PR1 du template n'utilise aucun placeholder `{base_url}` (subject/greeting/body n'en contiennent pas), et le template construit ses liens via `getEmailSiteUrl()` (qui lit `NEXT_PUBLIC_SITE_URL`, pas `NEXT_PUBLIC_BASE_URL`). Une variable `base_url` serait du code mort copié de `order-cancelled`/`order-refunded` et introduirait une incohérence d'env var ; on la retire.

- [ ] **(4) Relancer → succès.** `npm run test -- email/order-ready-for-pickup.test`. Sortie attendue : 9 `it` verts (interpolation sujet `{{...}}` + `resolves.toBeUndefined()`, interpolation greeting `{{firstName}}`, substitution `{{pickupPointName}}`, guard pickupCode manquant, guard pickupPoint null, guard provider `mondial_relay`, guard nom vide, fallback null, DB down).

- [ ] **(5) Type-check.** `npm run type-check` → aucune erreur. Le paramètre `pickupPoint: PickupPoint | null` est compatible avec un futur appel PR4 `{ pickupPoint: updatedOrder.pickup_point }` (où `pickup_point` est `PickupPoint | null`) sans cast.

- [ ] **(6) Commit.** `git add lolett-app/lib/email/order-ready-for-pickup.ts lolett-app/__tests__/email/order-ready-for-pickup.test.ts` puis `git commit -m "feat(email): sender 'commande prête au retrait' avec interpolate + guards Sentry"`.

---

### Task 5 : Bloc pickup conditionnel dans `order-confirmation-v3` + `order-new-admin`

> **Note d'ordre :** Task 2 a déjà supprimé le bloc inline `escapeHtml` d'`order-new-admin.ts` (~8 lignes), donc les numéros de ligne de ce fichier ont décalé. Toutes les modifications ci-dessous sont ancrées sur le **contenu** (`const isMR = …`, `const shippingBlock = …`, ternaire `data.shippingMethod === 'mondial_relay' …`), pas sur des numéros de ligne périmés.

**Files:**
- Modify: `lolett-app/lib/email/templates/order-confirmation-v3.ts` (signature `buildMapsUrl` + bloc adresse/point)
- Modify: `lolett-app/lib/email/order-new-admin.ts` (`shippingBlock`)
- Test: `lolett-app/__tests__/email/order-confirmation-pickup.test.ts`

**Cycle TDD :**

- [ ] **(1) Écrire le test qui échoue.** Créer `lolett-app/__tests__/email/order-confirmation-pickup.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { renderOrderConfirmationV3 } from '@/lib/email/templates/order-confirmation-v3';
import type { ClickCollectPickupPoint, MondialRelayPickupPoint } from '@/types';

const ADDRESS = {
  firstName: 'Marie',
  lastName: 'Dupont',
  address: '12 rue de la Paix',
  postalCode: '75002',
  city: 'Paris',
  country: 'France',
};

const BASE = {
  firstName: 'Marie',
  orderNumber: 'LOL-1',
  items: [{ productName: 'Blazer', size: 'M', quantity: 1, price: 149 }],
  subtotal: 149,
  shipping: 0,
  total: 149,
  address: ADDRESS,
};

const MR_POINT: MondialRelayPickupPoint = {
  provider: 'mondial_relay',
  id: 'mr-1',
  name: 'Tabac du Centre',
  address: '5 place X',
  postalCode: '75001',
  city: 'Paris',
  country: 'FR',
  lat: 48.8566,
  lng: 2.3522,
};

const CC_POINT: ClickCollectPickupPoint = {
  provider: 'click_collect',
  id: 'cc-1',
  name: 'Boutique du Marais',
  address: '12 rue de Bretagne',
  postalCode: '75003',
  city: 'Paris',
  country: 'FR',
  hours: 'Lun-Sam 10h-19h',
  instructions: null,
};

describe('renderOrderConfirmationV3 — bloc point de retrait', () => {
  it('affiche le titre Mondial Relay + lien Google Maps pour un point mondial_relay', () => {
    const html = renderOrderConfirmationV3({
      ...BASE,
      shippingMethod: 'mondial_relay',
      pickupPoint: MR_POINT,
    });
    expect(html).toContain('Point Relais Mondial Relay');
    expect(html).toContain('Tabac du Centre');
    expect(html).toContain('google.com/maps');
  });

  it('affiche le titre Click & Collect + la mention du futur email pour un point click_collect (sans lien Maps)', () => {
    const html = renderOrderConfirmationV3({
      ...BASE,
      shippingMethod: 'click_collect',
      pickupPoint: CC_POINT,
    });
    expect(html).toContain('Point de retrait Click &amp; Collect');
    expect(html).toContain('Boutique du Marais');
    expect(html).toContain('code de retrait d&egrave;s que votre commande sera pr&ecirc;te');
    expect(html).not.toContain('google.com/maps');
  });

  it("affiche l'adresse domicile quand il n'y a pas de point", () => {
    const html = renderOrderConfirmationV3({ ...BASE, shippingMethod: 'home' });
    expect(html).toContain('Livraison &agrave; domicile');
    expect(html).toContain('12 rue de la Paix');
  });
});
```

- [ ] **(2) Lancer le test → échec attendu.** `npm run test -- order-confirmation-pickup`. Sortie attendue : échecs (`Point de retrait Click & Collect` et la mention du futur email absents — le template ne gère que `mondial_relay` aujourd'hui).

- [ ] **(3a) Rendre `buildMapsUrl` type-safe sous l'union (OBLIGATOIRE avant le type-check).** Dans `lolett-app/lib/email/templates/order-confirmation-v3.ts`, changer l'import de type ET la signature de `buildMapsUrl`, car son corps accède à `p.lat`/`p.lng` qui n'existent plus sur le type de base après PR2 (cf. Note de cadrage 8).

  Remplacer l'import (L13) :

```ts
import type { ShippingMethod, PickupPoint } from '@/types';
```

  par :

```ts
import type { ShippingMethod, PickupPoint, MondialRelayPickupPoint } from '@/types';
```

  Puis remplacer la signature de `buildMapsUrl` (L47) :

```ts
function buildMapsUrl(p: PickupPoint): string {
```

  par :

```ts
function buildMapsUrl(p: MondialRelayPickupPoint): string {
```

  Le corps reste inchangé (`p.lat`/`p.lng` sont désormais valides puisque `MondialRelayPickupPoint` les déclare). `buildMapsUrl` n'est appelé que dans la branche `mondial_relay`, où `data.pickupPoint` est narrowé en `MondialRelayPickupPoint` par le discriminant `provider` — l'appel compile sans cast.

- [ ] **(3b) Ajouter les drapeaux pickup.** Dans `renderOrderConfirmationV3`, **avant** le `return` (juste après la fin de `itemsHtml`, vers L77), ajouter :

```ts
  const showPickup =
    !!data.pickupPoint &&
    (data.shippingMethod === 'mondial_relay' || data.shippingMethod === 'click_collect');
  const isClickCollect = data.pickupPoint?.provider === 'click_collect';
  const pickupTitle = isClickCollect
    ? 'Point de retrait Click &amp; Collect'
    : 'Point Relais Mondial Relay';
```

- [ ] **(3c) Remplacer le contenu du bloc « Adresse de livraison ou Point Relais ».** Dans `order-confirmation-v3.ts`, remplacer le ternaire interne `${data.shippingMethod === 'mondial_relay' && data.pickupPoint ? \`…\` : \`…\`}` (L199-214, à l'intérieur de `<td style="padding-left: 18px;">`) par :

```ts
                    ${showPickup && data.pickupPoint ? `
                    <p style="margin: 0 0 6px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: #C4956A;">${pickupTitle}</p>
                    <p style="margin: 0; font-size: 13px; font-weight: 500; color: #2C2420;">${data.pickupPoint.name}</p>
                    <p style="margin: 3px 0 0; font-size: 13px; color: #7A6E62;">${data.pickupPoint.address}</p>
                    <p style="margin: 3px 0 0; font-size: 13px; color: #7A6E62;">${data.pickupPoint.postalCode} ${data.pickupPoint.city} &middot; ${data.pickupPoint.country}</p>
                    ${data.pickupPoint.provider === 'mondial_relay' ? `
                    <p style="margin: 10px 0 0;">
                      <a href="${buildMapsUrl(data.pickupPoint)}" style="font-size: 12px; color: #C4956A; text-decoration: none; border-bottom: 1px solid #E8D9C4; padding-bottom: 1px;">Voir sur Google Maps &rarr;</a>
                    </p>
                    ${data.phone ? `<p style="margin: 12px 0 0; font-size: 11px; color: #B5A99A; line-height: 1.5;">Vous serez notifi&eacute; par SMS au ${data.phone} d&egrave;s que votre colis sera disponible au retrait.</p>` : ''}
                    ` : `
                    <p style="margin: 12px 0 0; font-size: 11px; color: #B5A99A; line-height: 1.5;">Vous recevrez un nouvel email avec votre code de retrait d&egrave;s que votre commande sera pr&ecirc;te.</p>
                    `}
                    ` : `
                    <p style="margin: 0 0 6px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: #C4956A;">Livraison &agrave; domicile</p>
                    <p style="margin: 0; font-size: 13px; color: #2C2420;">${data.address.firstName} ${data.address.lastName}</p>
                    <p style="margin: 3px 0 0; font-size: 13px; color: #7A6E62;">${data.address.address}</p>
                    <p style="margin: 3px 0 0; font-size: 13px; color: #7A6E62;">${data.address.postalCode} ${data.address.city}</p>
                    ${data.address.country && data.address.country !== 'France' ? `<p style="margin: 3px 0 0; font-size: 13px; color: #7A6E62;">${data.address.country}</p>` : ''}
                    `}
```

  Dans la branche `data.pickupPoint.provider === 'mondial_relay'`, `data.pickupPoint` est narrowé en `MondialRelayPickupPoint`, donc `buildMapsUrl(data.pickupPoint)` (signature `MondialRelayPickupPoint`) compile.

- [ ] **(4) Relancer → succès (confirmation).** `npm run test -- order-confirmation-pickup`. Sortie attendue : 3 `it` verts. Vérifier aussi que les tests existants de confirmation passent toujours.

- [ ] **(5a) Modifier `order-new-admin.ts`.** Remplacer le calcul `isMR`/`shippingBlock` par une logique provider-aware. Remplacer :

```ts
  const isMR = data.shippingMethod === 'mondial_relay';
  const pp = data.pickupPoint;

  const shippingBlock = isMR && pp
    ? `<tr>
        <td style="padding: 10px 0; color: #666; vertical-align: top;">Livraison</td>
        <td style="padding: 10px 0; font-weight: 600;">
          Mondial Relay<br/>
          <span style="font-weight: 400; color: #1a1510;">${escapeHtml(pp.name || '')}</span><br/>
          <span style="font-weight: 400; color: #666; font-size: 13px;">
            ${escapeHtml(pp.address || '')}<br/>
            ${escapeHtml(pp.postalCode || '')} ${escapeHtml(pp.city || '')}
          </span>
        </td>
      </tr>`
    : `<tr>
        <td style="padding: 10px 0; color: #666;">Livraison</td>
        <td style="padding: 10px 0; font-weight: 600;">
          Domicile<br/>
          <span style="font-weight: 400; color: #1a1510;">${safe.address}<br/>${safe.postal} ${safe.city}<br/>${safe.country}</span>
        </td>
      </tr>`;
```

par :

```ts
  const pp = data.pickupPoint;
  const hasPickupPoint =
    !!pp &&
    (data.shippingMethod === 'mondial_relay' || data.shippingMethod === 'click_collect');
  const isClickCollect = pp?.provider === 'click_collect';
  const carrierLabel = isClickCollect ? 'Click &amp; Collect' : 'Mondial Relay';

  const shippingBlock = hasPickupPoint && pp
    ? `<tr>
        <td style="padding: 10px 0; color: #666; vertical-align: top;">Livraison</td>
        <td style="padding: 10px 0; font-weight: 600;">
          ${carrierLabel}<br/>
          <span style="font-weight: 400; color: #1a1510;">${escapeHtml(pp.name || '')}</span><br/>
          <span style="font-weight: 400; color: #666; font-size: 13px;">
            ${escapeHtml(pp.address || '')}<br/>
            ${escapeHtml(pp.postalCode || '')} ${escapeHtml(pp.city || '')}
          </span>
          ${isClickCollect ? `<br/><span style="font-weight: 400; color: #B89547; font-size: 13px;">Action attendue : relayer la commande au point de vente, puis marquer « Prête au retrait » dans l'admin.</span>` : ''}
        </td>
      </tr>`
    : `<tr>
        <td style="padding: 10px 0; color: #666;">Livraison</td>
        <td style="padding: 10px 0; font-weight: 600;">
          Domicile<br/>
          <span style="font-weight: 400; color: #1a1510;">${safe.address}<br/>${safe.postal} ${safe.city}<br/>${safe.country}</span>
        </td>
      </tr>`;
```

- [ ] **(5b) Type-check.** `npm run type-check` → aucune erreur. (La signature `buildMapsUrl(p: MondialRelayPickupPoint)` est désormais valide sous l'union ; le narrowing par `provider` rend l'accès `lat`/`lng` et l'appel `buildMapsUrl(data.pickupPoint)` type-safe.)

- [ ] **(6) Commit.** `git add lolett-app/lib/email/templates/order-confirmation-v3.ts lolett-app/lib/email/order-new-admin.ts lolett-app/__tests__/email/order-confirmation-pickup.test.ts` puis `git commit -m "feat(email): bloc point de retrait provider-aware (confirmation client + notif admin)"`.

---

### Task 6 : Branches CMS `order_ready_for_pickup` (preview / test / preview-all) + variables

**Files:**
- Modify: `lolett-app/components/admin/emails/types.ts` (`VARIABLES_BY_TEMPLATE` L19-26)
- Modify: `lolett-app/app/api/admin/emails/preview/route.ts`
- Modify: `lolett-app/app/api/admin/emails/test/route.ts`
- Modify: `lolett-app/app/api/admin/emails/preview-all/route.ts`
- Test: `lolett-app/__tests__/email/cms-variables.test.ts`

**Cycle TDD :**

- [ ] **(1) Écrire le test qui échoue.** Créer `lolett-app/__tests__/email/cms-variables.test.ts` (test de la seule logique testable unitairement sans Next runtime — la table des variables) :

```ts
import { describe, it, expect } from 'vitest';
import { VARIABLES_BY_TEMPLATE } from '@/components/admin/emails/types';

describe('VARIABLES_BY_TEMPLATE', () => {
  it('déclare les variables du template order_ready_for_pickup', () => {
    expect(VARIABLES_BY_TEMPLATE.order_ready_for_pickup).toEqual([
      '{firstName}',
      '{orderNumber}',
      '{pickupCode}',
      '{pickupPointName}',
    ]);
  });
});
```

> **Note (cohérence affichage CMS) :** la table `VARIABLES_BY_TEMPLATE` est purement informative (chips affichées à Lola dans `/admin/emails`). On garde la convention simple-accolade `{var}` du reste de la table (les autres entrées l'utilisent), même si le moteur réel et le seed utilisent `{{var}}` : `interpolate()` accepte les deux, et l'affichage des variables disponibles n'a pas d'impact fonctionnel sur la substitution.

- [ ] **(2) Lancer le test → échec attendu.** `npm run test -- cms-variables`. Sortie attendue : échec `expected undefined to deeply equal [ ... ]` (clé `order_ready_for_pickup` absente).

- [ ] **(3a) Ajouter la clé dans `types.ts`.** Dans `lolett-app/components/admin/emails/types.ts`, ajouter la ligne à `VARIABLES_BY_TEMPLATE` (après `welcome_newsletter`, L25) :

```ts
  welcome_newsletter: ['{firstName}', '{promoCode}'],
  order_ready_for_pickup: ['{firstName}', '{orderNumber}', '{pickupCode}', '{pickupPointName}'],
```

- [ ] **(4) Relancer → succès.** `npm run test -- cms-variables`. Sortie attendue : 1 `it` vert.

- [ ] **(5a) Ajouter la branche dans `preview/route.ts`.** Ajouter l'import en tête (après L9) :

```ts
import { renderOrderReadyForPickupV3, type EmailOverrides as ReadyForPickupOverrides } from '@/lib/email/templates/order-ready-for-pickup-v3';
```

Ajouter la constante mock après `MOCK_REFUNDED_DATA` (L64) :

```ts
const MOCK_PICKUP_DATA = {
  firstName: 'Marie',
  orderNumber: 'LOL-20260530-TEST',
  pickupCode: 'LOL-A7K2X',
  pickupPoint: {
    provider: 'click_collect' as const,
    id: 'pp-demo',
    name: 'Boutique du Marais',
    address: '12 rue de Bretagne',
    postalCode: '75003',
    city: 'Paris',
    country: 'FR',
    hours: 'Lun-Sam 10h-19h',
    instructions: "Sonner à l'interphone LOLETT",
  },
};
```

Ajouter la branche avant le `else` final (après `renderWelcomeNewsletterV3`, vers L126) :

```ts
    } else if (template_key === 'order_ready_for_pickup') {
      // Major #5 / A8 : ce template n'est PAS couvert par applyOverrides()
      // (dont les regex /Merci, .+?\./ et /Nous préparons.../ ciblent l'ancien
      // template confirmation). On passe donc les overrides CMS DIRECTEMENT au
      // template via son param `overrides`, pour que l'aperçu admin reflète bien
      // le greeting/body_text/signoff édités par Lola. On `return` aussitôt pour
      // SAUTER le `applyOverrides` final (qui ne s'applique qu'aux autres templates).
      const pickupOverrides: ReadyForPickupOverrides = {
        greeting: merged.greeting,
        body_text: merged.body_text,
        signoff: merged.signoff,
      };
      const pickupHtml = renderOrderReadyForPickupV3(MOCK_PICKUP_DATA, pickupOverrides);
      return NextResponse.json({ html: pickupHtml });
```

  Justification (major #5, scénario A8) : `applyOverrides(html, merged)` est conçu pour l'ancien template `order_confirmation` (regex `/Merci, .+?\./`, `/Nous préparons vos pièces avec soin\./`). Le greeting du nouveau template par défaut est `'Bonne nouvelle, Marie.'` (ne matche pas `/Merci, .+?\./`) et son body ne matche pas `/Nous préparons.../` — donc `applyOverrides` n'appliquerait JAMAIS le greeting/body CMS, et l'aperçu admin ne montrerait pas le texte édité par Lola (régression silencieuse de A8). En passant les overrides directement au template via son paramètre `overrides` (qui gère `{firstName}`/`{{firstName}}`) PUIS en `return`-ant avant `applyOverrides`, l'aperçu reflète fidèlement le rendu réel. Le `replace('♥', '&hearts;')` du template gère le signoff CMS.

- [ ] **(5b) Ajouter la branche dans `test/route.ts`.** Ajouter l'import (après L9) :

```ts
import { renderOrderReadyForPickupV3 } from '@/lib/email/templates/order-ready-for-pickup-v3';
```

Ajouter la branche avant le `else` final (après `welcome_newsletter`, vers L99) :

```ts
    } else if (template_key === 'order_ready_for_pickup') {
      html = renderOrderReadyForPickupV3(
        {
          firstName: 'Marie',
          orderNumber: 'LOL-20260530-TEST',
          pickupCode: 'LOL-A7K2X',
          pickupPoint: {
            provider: 'click_collect',
            id: 'pp-demo',
            name: 'Boutique du Marais',
            address: '12 rue de Bretagne',
            postalCode: '75003',
            city: 'Paris',
            country: 'FR',
            hours: 'Lun-Sam 10h-19h',
            instructions: "Sonner à l'interphone LOLETT",
          },
        },
        settings
          ? { greeting: settings.greeting, body_text: settings.body_text, signoff: settings.signoff }
          : undefined
      );
      subject = settings?.subject_template
        ?.replace('{{orderNumber}}', 'LOL-20260530-TEST')
        .replace('{orderNumber}', 'LOL-20260530-TEST')
        .replace('{{pickupCode}}', 'LOL-A7K2X')
        .replace('{pickupCode}', 'LOL-A7K2X')
        || 'Votre commande LOL-20260530-TEST est prête au retrait — code LOL-A7K2X';
```

  Notes :
  - On enchaîne `.replace` pour `{{var}}` ET `{var}` comme `order_cancelled`/`order_refunded` (L82-83, L92-94) — par cohérence avec le style local de ce fichier. Le subject réel du seed PR1 est `'Votre commande {{orderNumber}} est prête au retrait — code {{pickupCode}}'` (uniquement `{{orderNumber}}`/`{{pickupCode}}`), donc les seuls placeholders à substituer ici sont ceux-là.
  - **Vérif strict :** `settings?.subject_template?.replace(...)...` est de type `string | undefined` (le `?.` court-circuite à `undefined` si `subject_template` est absent) ; le `|| 'fallback'` le ramène à `string`. La variable `subject` est déclarée `let subject: string` (L54), donc l'affectation compile sous `strict`.
  - On passe AUSSI les overrides CMS au template (comme en 5a), pour que l'email de test reflète le greeting/body édité ; sans ça, le test admin n'enverrait que le greeting par défaut. Le bloc existant `if (settings?.signoff) { html = html.replace(/Avec amour, LOLETT &hearts;/g, ...) }` (L104-106) reste appliqué à TOUS les templates après ce `if/else` — pour le nouveau template, le signoff a déjà été injecté via `overrides.signoff`, donc ce `replace` post-rendu est un no-op (le texte `'Avec amour, LOLETT &hearts;'` aura déjà été remplacé par le signoff CMS) ; sans effet de bord négatif.

- [ ] **(5c) Ajouter la branche dans `preview-all/route.ts`.** Ajouter l'import (après L5) :

```ts
import { renderOrderReadyForPickupV3 } from '@/lib/email/templates/order-ready-for-pickup-v3';
```

Ajouter un `case` dans le `switch` (après `case 'welcome-newsletter'`, vers L154) :

```ts
      case 'order-ready-for-pickup':
        html = renderOrderReadyForPickupV3({
          firstName: 'Lola',
          orderNumber: 'LOL-2026-0042',
          pickupCode: 'LOL-A7K2X',
          pickupPoint: {
            provider: 'click_collect',
            id: 'pp-demo',
            name: 'Boutique du Marais',
            address: '12 rue de Bretagne',
            postalCode: '75003',
            city: 'Paris',
            country: 'FR',
            hours: 'Lun-Sam 10h-19h',
            instructions: "Sonner à l'interphone LOLETT",
          },
        });
        break;
```

Ajouter la carte correspondante dans `indexPage()` (dans la `.grid`, après la carte « Bienvenue newsletter », vers L81) :

```ts
    <div class="card">
      <div class="who">&rarr; Client</div>
      <h3>Commande prête au retrait</h3>
      <p>Click & Collect : envoyé quand l'admin marque "Prête au retrait". Contient le code de retrait.</p>
      <a href="?template=order-ready-for-pickup" target="_blank">Voir</a>
    </div>
```

- [ ] **(5c-bis) Mettre à jour le compteur du sous-titre.** Toujours dans `preview-all/route.ts`, dans `indexPage()`, remplacer la ligne du sous-titre (L44) :

```ts
  <p class="sub">6 templates — cliquez pour voir le rendu</p>
```

par :

```ts
  <p class="sub">7 templates — cliquez pour voir le rendu</p>
```

(L'ajout de la carte « Commande prête au retrait » porte le total affiché à 7 ; sans ce changement, le texte resterait incohérent à « 6 templates ».)

- [ ] **(5d) Type-check.** `npm run type-check` → aucune erreur (le `provider: 'click_collect'` littéral satisfait l'union ; `as const` dans `preview/route.ts` MOCK pour préserver le type littéral du discriminant ; les `settings` passés en overrides sont de type `EmailSettings | null` → narrowés en objet ou `undefined`).

- [ ] **(5e) Vérif manuelle (routes Next, non testables unitairement).** Lancer `npm run dev`, se connecter en admin, ouvrir `http://localhost:3000/api/admin/emails/preview-all?template=order-ready-for-pickup` → le rendu HTML affiche le code `LOL-A7K2X` dans l'encadré or, le point « Boutique du Marais », horaires et instructions. Vérifier sur la page index (`?template=index`) que le sous-titre indique « 7 templates » et que la carte « Commande prête au retrait » est présente. Dans `/admin/emails`, sélectionner le template « Commande prête au retrait », **modifier le greeting** (ex. `'Coucou {{firstName}}, c'est prêt !'`), cliquer Aperçu → vérifier que l'aperçu affiche bien le greeting modifié (preuve que les overrides sont passés directement au template, cf. major #5/A8), et que les variables `{firstName}/{orderNumber}/{pickupCode}/{pickupPointName}` s'affichent.

- [ ] **(6) Commit.** `git add lolett-app/components/admin/emails/types.ts lolett-app/app/api/admin/emails/preview/route.ts lolett-app/app/api/admin/emails/test/route.ts lolett-app/app/api/admin/emails/preview-all/route.ts lolett-app/__tests__/email/cms-variables.test.ts` puis `git commit -m "feat(admin): preview/test CMS pour l'email 'prête au retrait' + variables"`.

---

## Vérification finale PR3

- [ ] **Type-check vert :** `npm run type-check` (depuis `lolett-app/`) → 0 erreur. Aucun `any` introduit (narrowing par `provider` partout ; `buildMapsUrl` re-typé en `MondialRelayPickupPoint` ; sender typé `pickupPoint: PickupPoint | null` puis narrowé par guard).
- [ ] **Tests verts :** `npm run test` → toute la suite passe, dont :
  - `__tests__/orders/pickup-code.test.ts` (8 it : format, alphabet, variété, succès 1er essai, retry 23505, null après 8, idempotence no-op sans log via `.maybeSingle()`, erreur non-23505 loggée)
  - `__tests__/email/order-ready-for-pickup-template.test.ts` (8 it : code hero, greeting défaut, bloc point, escapeHtml, masquage horaires/instructions, signoff override, greeting override `{{firstName}}`, pas de CTA)
  - `__tests__/email/order-ready-for-pickup.test.ts` (9 it : interpolation sujet `{{...}}`+`resolves.toBeUndefined()`, interpolation greeting `{{firstName}}`, substitution `{{pickupPointName}}`, guard pickupCode, guard pickupPoint null, guard provider mondial_relay, guard nom vide, fallback null, DB down)
  - `__tests__/email/order-confirmation-pickup.test.ts` (3 it : titre MR + lien Maps vs C&C + mention futur email sans Maps vs domicile)
  - `__tests__/email/cms-variables.test.ts` (1 it : `VARIABLES_BY_TEMPLATE.order_ready_for_pickup`)
  - `__tests__/lib/utils/escape-html.test.ts` (toujours vert après réutilisation dans `order-new-admin`)
- [ ] **Lint/validate :** `npm run validate` → vert.
- [ ] **Scénarios du spec couverts :**
  - §8.1 — `assignPickupCodeAtomic` : UPDATE atomique `.is('pickup_code', null)` via `.maybeSingle()` (idempotence no-op silencieux, convention D3), retry 23505, code `LOL-XXXXX` alphabet 32. ✅
  - §9.1 — template v3 : header logo, badge « Prête au retrait », greeting interpolé, body, bloc CODE hero (monospace 24px, letter-spacing 0.08em, encadré or), bloc point (📍/⏰/💡), pas de CTA, signoff + footer, escapeHtml sur les champs point de retrait + code/orderNumber. ✅
  - §9.2 — sender Groupe A (structure) : guards anti-email-partiel + Sentry (D1 : `provider === 'click_collect'` + non-null + nom), `interpolate()` (`{var}` ET `{{var}}`, seed PR1 en `{{var}}`), `getEmailSettings('order_ready_for_pickup')`, signature `Promise<void>` (pas de `return result`), param `pickupPoint: PickupPoint | null`. ✅
  - §9.3 — `order-confirmation-v3` (bloc pickup conditionnel par provider + mention futur email pour C&C, lien Maps réservé à MR) et `order-new-admin` (point + action attendue). ✅
  - §9.5 — branches CMS preview/test/preview-all + sous-titre « 7 templates » + `VARIABLES_BY_TEMPLATE.order_ready_for_pickup` + aperçu admin reflétant les overrides CMS (A8, major #5). ✅
- [ ] **Sécurité :** aucun secret committé ; les champs **point de retrait** (name/address/postalCode/city/hours/instructions) + code/orderNumber du nouveau template passent par `escapeHtml` (anti-injection des données dynamiques). `greeting`/`body_text`/`signoff` proviennent du CMS admin (surface de confiance, même modèle de menace que les autres templates v3 — cf. Note de cadrage 9 ; `firstName` injecté brut dans le greeting comme dans `order-confirmation-v3`).

---

## Lien avec les autres PRs

- **Dépend de PR1 (migrations DB)** : colonnes `orders.pickup_code`, `orders.ready_for_pickup_at`, `orders.picked_up_at`, contrainte UNIQUE sur `pickup_code` (sinon le retry 23505 n'a jamais lieu), 13 statuts (dont `ready_for_pickup`/`picked_up`), seed `email_settings.order_ready_for_pickup` — **format réel : placeholders `{{var}}` (double accolade) + signoff `'Avec amour, LOLETT ♥'` (U+2665) + greeting `'Bonne nouvelle, {{firstName}} ✨'`** (le spec §4.4 écrivait `{var}` + `♡` U+2661, corrigé par PR1). Plan : `docs/superpowers/plans/2026-05-29-click-collect-pr1-migrations-db.md` (L412-427).
- **Dépend de PR2 (types & constantes)** : `PickupPoint` union discriminée (`MondialRelayPickupPoint` avec `lat?/lng?` | `ClickCollectPickupPoint` avec `provider`, `hours`, `instructions`), `ShippingMethod` incluant `'click_collect'`, mapper `mapPickupPoint` qui backfille `provider` sur les snapshots legacy, `SHIPPING_RATES` en `Partial<Record<ShippingMethod, number>>` avec `click_collect: 0` (FR uniquement). Sans PR2, `ClickCollectPickupPoint`, `MondialRelayPickupPoint` et `provider` ne compilent pas — **PR3 s'exécute après PR2**. (État actuel vérifié : `lolett-app/types/index.ts` n'a PAS encore l'union ni `ClickCollectPickupPoint`/`MondialRelayPickupPoint`.)
- **Consommée par PR4 « admin / backend transitions » (§7.7, §8.2, §9.4 — décision D4)** : c'est PR4 qui modifiera `lolett-app/app/api/admin/orders/[id]/route.ts` pour : (a) ajouter `ready_for_pickup`/`picked_up` aux statuts gérés (via `ORDER_STATUS_TRANSITIONS` de PR2), (b) appeler `assignPickupCodeAtomic(supabase, params.id, { status:'ready_for_pickup', ready_for_pickup_at: new Date().toISOString() })` lors de la transition vers `ready_for_pickup` (avec le guard provider du §8.2), (c) déclencher `sendOrderReadyForPickupEmail({ to, firstName, orderNumber, pickupCode, pickupPoint: updatedOrder.pickup_point })` via `after()` — **PR3 expose la signature `pickupPoint: PickupPoint | null` (D1)** pour que cet appel compile SANS narrowing/cast, et le sender renvoie `Promise<void>`, (d) **skipper `order-shipped` pour `click_collect`** (§9.4 → PR4, D4). PR4 recâble aussi `REFUNDABLE_STATUSES` (D2) dans `refund/route.ts` + `RefundDialog.tsx` ; PR3 n'y touche pas. **PR3 ne modifie PAS cette route — elle ne fournit que le helper et le sender.**
- **Interaction Stripe (§10, PR5 dédiée)** : le webhook continuera d'appeler `sendOrderConfirmation` / `sendNewOrderAlertToAdmin`, désormais provider-aware grâce à la Task 5 (au sens `PickupPoint.provider` ; le provider d'envoi `sendHtmlEmail` Brevo→SMTP→Resend reste inchangé). Le webhook PR5 lit `pickup_points` via `.maybeSingle()` (D3) et utilise `metadata.pickup_point_id` + `metadata.pickup_provider` (clés PLATES snake_case, distinctes du snapshot JSON `pickupPoint` en camelCase — D5). Aucun changement webhook dans PR3.