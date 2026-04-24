# Launch Readiness Steps 3–9 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finalize launch-readiness work for LOLETT e-commerce — reset password flow, editable order-lifecycle emails, low-stock monitoring, Sentry error tracking, newsletter wiring, SEO schema.org, and automated Supabase backups.

**Architecture:** 7 independent subsystems, each deliverable on its own. All work lands on branch `preview`. Each task follows TDD where meaningful (UI/email flows get E2E or integration tests; infra tasks get smoke tests). Frequent commits — one feature-complete commit per task group.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase (Auth + Postgres + Storage), Resend (transactional email), Tailwind v4, Zod, Vitest + Playwright, Vercel (Cron Jobs + Blob). Newsletter provider: **Resend Audiences** (already in `package.json`, no new vendor). Monitoring: **Sentry** (`@sentry/nextjs`).

**Branch discipline:** all commits land on `preview`. Each section ends with `git push origin preview`.

---

## File Structure

### Task 3 — Reset Password (already scaffolded, needs finishing)
- Modify: `lolett-app/components/auth/LoginForm.tsx` — add "Mot de passe oublié ?" link
- Modify: `lolett-app/components/auth/ResetPasswordForm.tsx` — handle recovery token in URL
- Modify: `lolett-app/app/connexion/page.tsx` — show success banner when `?reset=success`
- Create: `lolett-app/e2e/reset-password.spec.ts` — Playwright flow
- Supabase Dashboard (manual, documented): add `https://lolett.vercel.app/reset-password` and `https://<preview>.vercel.app/reset-password` to **Auth → URL Configuration → Redirect URLs**

### Task 4 — CMS Templates for order_cancelled / order_refunded
- Create: `lolett-app/supabase/migrations/20260424120000_seed_cancel_refund_email_settings.sql`
- Modify: `lolett-app/lib/email/order-cancelled.ts` — use `getEmailSettings('order_cancelled')` like the other templates
- Modify: `lolett-app/lib/email/order-refunded.ts` — same
- Modify: `lolett-app/app/admin/emails/page.tsx` — register the two new templates in the tabs list

### Task 5 — Low-stock alerts + auto-sold-out
- Create: `lolett-app/lib/admin/low-stock.ts` — DB query returning variants with `stock <= LOW_THRESHOLD`
- Create: `lolett-app/components/admin/dashboard/LowStockWidget.tsx`
- Modify: `lolett-app/app/admin/page.tsx` — render `LowStockWidget`
- Modify: `lolett-app/lib/constants.ts` — expose `STOCK.LOW_THRESHOLD` (already exists — confirm value)
- Modify: `lolett-app/components/product/ProductCard.tsx` — already shows "Victime de son succès" when `totalStock === 0`; confirm shop grid sorts sold-out last
- Modify: `lolett-app/app/shop/page.tsx` (or equivalent listing) — add `ORDER BY (total_stock = 0), created_at DESC`
- Test: `lolett-app/__tests__/admin/low-stock.test.ts`

### Task 6 — Sentry monitoring
- Install: `@sentry/nextjs`
- Create: `lolett-app/sentry.client.config.ts`
- Create: `lolett-app/sentry.server.config.ts`
- Create: `lolett-app/sentry.edge.config.ts`
- Modify: `lolett-app/next.config.ts` — wrap with `withSentryConfig`
- Modify: `lolett-app/instrumentation.ts` (create if missing)
- Modify: `.env.example` — document `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `NEXT_PUBLIC_SENTRY_DSN`
- Create: `lolett-app/app/api/_sentry-test/route.ts` — deliberate error endpoint to verify wiring

### Task 7 — Newsletter (Resend Audiences)
- Create: `lolett-app/app/api/newsletter/subscribe/route.ts`
- Create: `lolett-app/supabase/migrations/20260424130000_newsletter_subscribers.sql` — fallback store with RLS
- Modify: `lolett-app/components/sections/home-v3/NewsletterSection.tsx` — wire form submit to `/api/newsletter/subscribe`
- Modify: `lolett-app/components/editorial/NewsletterForm.tsx` — same
- Modify: `lolett-app/components/contact/ContactNewsletter.tsx` — same
- Modify: `.env.example` — `RESEND_AUDIENCE_ID`
- Test: `lolett-app/__tests__/api/newsletter-subscribe.test.ts`

### Task 8 — Schema.org JSON-LD on product pages
- Create: `lolett-app/lib/seo/product-jsonld.ts`
- Modify: `lolett-app/app/produit/[slug]/page.tsx` — render `<script type="application/ld+json">` with Product + Offer + AggregateRating (if reviews exist, otherwise omit)
- Test: `lolett-app/__tests__/seo/product-jsonld.test.ts`

### Task 9 — Automated Supabase backup
- Create: `lolett-app/app/api/cron/backup/route.ts`
- Modify: `lolett-app/vercel.json` (create if missing) — register cron `0 3 * * *` (3 AM UTC daily)
- Modify: `.env.example` — `CRON_SECRET`, `BLOB_READ_WRITE_TOKEN`
- Test: `lolett-app/__tests__/api/cron-backup.test.ts`

---

## Task 3 — Reset Password Flow

**Context:** UI exists at `/mot-de-passe-oublie` and `/reset-password`. Supabase call `resetPasswordForEmail` is wired. What's missing: login-page entry point, recovery token exchange handling on `/reset-password`, E2E test, success banner.

**Files:**
- Modify: `lolett-app/components/auth/LoginForm.tsx`
- Modify: `lolett-app/components/auth/ResetPasswordForm.tsx`
- Modify: `lolett-app/app/connexion/page.tsx`
- Create: `lolett-app/e2e/reset-password.spec.ts`

### Step 3.1 — Verify Supabase redirect URLs (manual, blocking)

- [ ] **Step 3.1.1: Document redirect URLs to add via Supabase Dashboard**

Open Supabase Dashboard → project `qczdwrudgmozyxkdidmr` → Authentication → URL Configuration → Redirect URLs. Ensure these are present:
- `https://lolett.vercel.app/reset-password`
- `https://*.vercel.app/reset-password` (wildcard for previews)
- `http://localhost:3001/reset-password` (local dev)

If missing, add them and save. (This is Lola's Supabase; credentials in SESSION.md.)

- [ ] **Step 3.1.2: Verify Site URL matches production**

Same page, `Site URL` field → should be `https://lolett.vercel.app` (until custom domain).

### Step 3.2 — Add "Mot de passe oublié ?" link on login

- [ ] **Step 3.2.1: Locate the password input block in LoginForm**

Run: `grep -n "type=\"password\"" lolett-app/components/auth/LoginForm.tsx`
Expected: one line with the password input.

- [ ] **Step 3.2.2: Insert link below the password input**

Add right after the `<input type="password" … />` element (still inside its `<div>`):

```tsx
<div className="mt-1.5 text-right">
  <Link
    href="/mot-de-passe-oublie"
    className="text-xs text-[#1B0B94] hover:text-[#B89547] transition-colors font-body"
  >
    Mot de passe oublié&nbsp;?
  </Link>
</div>
```

Ensure `import Link from 'next/link';` is at the top of the file (add if missing).

- [ ] **Step 3.2.3: Commit**

```bash
git add lolett-app/components/auth/LoginForm.tsx
git commit -m "feat(auth): lien 'Mot de passe oublié ?' sur page connexion"
```

### Step 3.3 — Show success banner on `/connexion?reset=success`

- [ ] **Step 3.3.1: Read current connexion/page.tsx**

Run: `cat lolett-app/app/connexion/page.tsx`

- [ ] **Step 3.3.2: Pass `searchParams` down to LoginForm**

If the page is a server component, extract `reset` from `searchParams` and pass to `LoginForm` as a boolean prop `resetSuccess`. If it's already a client component, use `useSearchParams()` inside `LoginForm` directly.

Modified snippet (server component case):

```tsx
interface PageProps {
  searchParams: Promise<{ reset?: string }>;
}

export default async function ConnexionPage({ searchParams }: PageProps) {
  const { reset } = await searchParams;
  return <LoginForm resetSuccess={reset === 'success'} />;
}
```

- [ ] **Step 3.3.3: Render banner in LoginForm**

Add `resetSuccess` to the props interface. At the top of the form `<div>` add:

```tsx
{resetSuccess && (
  <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm text-center font-body">
    Mot de passe mis à jour. Tu peux te connecter.
  </div>
)}
```

- [ ] **Step 3.3.4: Commit**

```bash
git add lolett-app/components/auth/LoginForm.tsx lolett-app/app/connexion/page.tsx
git commit -m "feat(auth): bandeau succès après reset password"
```

### Step 3.4 — Handle recovery token exchange on `/reset-password`

Supabase v2 exchanges the recovery token automatically on the client via `detectSessionInUrl` (default on), so `supabase.auth.updateUser` works once the page mounts. But if the user lands without a valid session we must show an error instead of a blank form.

- [ ] **Step 3.4.1: Write the failing test**

Create `lolett-app/__tests__/auth/reset-password-form.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      updateUser: vi.fn(),
    },
  }),
}));

describe('ResetPasswordForm', () => {
  it('shows invalid-link error when no session is present', async () => {
    render(<ResetPasswordForm />);
    await waitFor(() => {
      expect(
        screen.getByText(/lien expiré ou invalide/i),
      ).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 3.4.2: Run — expect failure**

Run: `pnpm test __tests__/auth/reset-password-form.test.tsx`
Expected: FAIL (the form does not render that copy yet).

- [ ] **Step 3.4.3: Implement session check**

Add at the top of the component body, before the existing `useState` calls:

```tsx
const [validLink, setValidLink] = useState<boolean | null>(null);

useEffect(() => {
  let active = true;
  supabase.auth.getSession().then(({ data }) => {
    if (!active) return;
    setValidLink(!!data.session);
  });
  return () => {
    active = false;
  };
}, []);
```

And import `useEffect` from React.

Replace the outer JSX (currently always renders the form) with a conditional:

```tsx
{validLink === false ? (
  <div className="text-center">
    <p className="text-[#5a4d3e] font-body text-sm mb-6">
      Lien expiré ou invalide. Demande un nouveau lien de réinitialisation.
    </p>
    <Link href="/mot-de-passe-oublie" className="text-[#1B0B94] hover:text-[#B89547]">
      Demander un nouveau lien
    </Link>
  </div>
) : validLink === null ? (
  <p className="text-center text-sm text-[#5a4d3e]">Vérification en cours…</p>
) : (
  /* existing <form> */
)}
```

- [ ] **Step 3.4.4: Run — expect pass**

Run: `pnpm test __tests__/auth/reset-password-form.test.tsx`
Expected: PASS.

- [ ] **Step 3.4.5: Commit**

```bash
git add lolett-app/components/auth/ResetPasswordForm.tsx lolett-app/__tests__/auth/reset-password-form.test.tsx
git commit -m "feat(auth): reset-password affiche erreur si lien expiré"
```

### Step 3.5 — E2E Playwright test

- [ ] **Step 3.5.1: Write the E2E spec**

Create `lolett-app/e2e/reset-password.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('Reset password flow', () => {
  test('shows the forgot-password link on login page', async ({ page }) => {
    await page.goto('/connexion');
    const link = page.getByRole('link', { name: /mot de passe oublié/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/mot-de-passe-oublie$/);
    await expect(page.getByRole('heading', { name: /mot de passe oublié/i })).toBeVisible();
  });

  test('reset-password page without token shows invalid-link error', async ({ page }) => {
    await page.goto('/reset-password');
    await expect(page.getByText(/lien expiré ou invalide/i)).toBeVisible();
  });
});
```

- [ ] **Step 3.5.2: Run against local dev**

Run (in a separate shell): `PORT=3001 pnpm dev`
Then: `pnpm test:e2e e2e/reset-password.spec.ts`
Expected: 2 passed.

- [ ] **Step 3.5.3: Commit**

```bash
git add lolett-app/e2e/reset-password.spec.ts
git commit -m "test(auth): E2E reset-password flow"
```

### Step 3.6 — Push

- [ ] **Step 3.6.1: Push**

Run: `git push origin preview`

---

## Task 4 — CMS Editable Templates for order_cancelled / order_refunded

**Context:** `email_settings` table drives 5 email templates (`order_confirmation`, `order_shipped`, `order_delivered`, `welcome_newsletter`, and `contact_acknowledgment`). The `order_cancelled-v3.ts` and `order-refunded-v3.ts` sending functions were added yesterday but don't yet read from `email_settings` — their copy is hardcoded. This task seeds the two rows and wires the templates through `getEmailSettings()`.

**Files:**
- Create: `lolett-app/supabase/migrations/20260424120000_seed_cancel_refund_email_settings.sql`
- Modify: `lolett-app/lib/email/order-cancelled.ts`
- Modify: `lolett-app/lib/email/order-refunded.ts`
- Modify: `lolett-app/app/admin/emails/page.tsx`

### Step 4.1 — Write the seed migration

- [ ] **Step 4.1.1: Inspect one existing row to confirm schema**

Run (through Supabase MCP or SQL Editor): `SELECT * FROM email_settings WHERE template_key='order_confirmation' LIMIT 1;`

- [ ] **Step 4.1.2: Create migration file**

Write `lolett-app/supabase/migrations/20260424120000_seed_cancel_refund_email_settings.sql`:

```sql
-- Seed email_settings rows for order_cancelled and order_refunded

INSERT INTO public.email_settings (
  template_key, label, from_name, from_email,
  subject_template, greeting, body_text, cta_text, cta_url, signoff, extra_params
) VALUES
(
  'order_cancelled',
  'Commande annulée',
  'LOLETT',
  'hello@lolett.fr',
  'Ta commande {{order_number}} a été annulée',
  'Bonjour {{first_name}},',
  'Ta commande {{order_number}} a été annulée. Si un paiement a été prélevé, le remboursement est en cours (sous 5–10 jours ouvrés selon ta banque). Pour toute question, réponds simplement à cet email.',
  'Voir mes commandes',
  '{{base_url}}/compte/commandes',
  'À très vite,\nLolett',
  '{}'::jsonb
),
(
  'order_refunded',
  'Commande remboursée',
  'LOLETT',
  'hello@lolett.fr',
  'Remboursement confirmé pour ta commande {{order_number}}',
  'Bonjour {{first_name}},',
  'Ton remboursement de {{refund_amount}} € pour la commande {{order_number}} a été validé. Il apparaîtra sur ton compte bancaire sous 5–10 jours ouvrés.',
  'Voir mes commandes',
  '{{base_url}}/compte/commandes',
  'À très vite,\nLolett',
  '{}'::jsonb
)
ON CONFLICT (template_key) DO NOTHING;
```

- [ ] **Step 4.1.3: Apply migration to Lola's Supabase**

Run (via Supabase MCP): `mcp__claude_ai_Supabase__apply_migration` with name `seed_cancel_refund_email_settings` and the SQL body above.

Expected: 2 rows inserted (or "ON CONFLICT DO NOTHING" if already run).

- [ ] **Step 4.1.4: Verify rows exist**

Run: `SELECT template_key, label FROM email_settings WHERE template_key IN ('order_cancelled','order_refunded');`
Expected: 2 rows.

### Step 4.2 — Wire templates through `getEmailSettings()`

- [ ] **Step 4.2.1: Read one of the already-wired senders for reference**

Run: `cat lolett-app/lib/email/order-confirmation.ts` — use its structure as the template.

- [ ] **Step 4.2.2: Write the failing test**

Create `lolett-app/__tests__/email/order-cancelled.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/cms/emails', () => ({
  getEmailSettings: vi.fn().mockResolvedValue({
    template_key: 'order_cancelled',
    label: 'Commande annulée',
    from_name: 'LOLETT',
    from_email: 'hello@lolett.fr',
    subject_template: 'Ta commande {{order_number}} a été annulée',
    greeting: 'Bonjour {{first_name}},',
    body_text: 'Annulée.',
    cta_text: 'Voir',
    cta_url: '{{base_url}}/compte/commandes',
    signoff: 'Lolett',
    extra_params: {},
  }),
}));

const sendEmailMock = vi.fn().mockResolvedValue({ success: true });
vi.mock('@/lib/email', () => ({ sendEmail: sendEmailMock }));

import { sendOrderCancelledEmail } from '@/lib/email/order-cancelled';

describe('sendOrderCancelledEmail', () => {
  it('interpolates order_number in subject and uses CMS copy', async () => {
    await sendOrderCancelledEmail({
      to: 'c@x.fr',
      firstName: 'Camille',
      orderNumber: 'LOL-123',
    });
    const call = sendEmailMock.mock.calls[0][0];
    expect(call.subject).toContain('LOL-123');
    expect(call.to).toBe('c@x.fr');
  });
});
```

- [ ] **Step 4.2.3: Run — expect failure**

Run: `pnpm test __tests__/email/order-cancelled.test.ts`
Expected: FAIL (current sender hardcodes subject or doesn't export the right signature).

- [ ] **Step 4.2.4: Refactor `order-cancelled.ts` to use `getEmailSettings`**

Open `lolett-app/lib/email/order-cancelled.ts`. Model it on `order-confirmation.ts`:

```ts
import { sendEmail } from '@/lib/email';
import { getEmailSettings } from '@/lib/cms/emails';
import { renderOrderCancelledEmail } from '@/lib/email/templates/order-cancelled-v3';

export interface OrderCancelledArgs {
  to: string;
  firstName: string;
  orderNumber: string;
}

export async function sendOrderCancelledEmail(args: OrderCancelledArgs) {
  const settings = await getEmailSettings('order_cancelled');
  if (!settings) {
    return { success: false, error: 'Email settings not configured' };
  }

  const interpolate = (s: string) =>
    s
      .replaceAll('{{first_name}}', args.firstName)
      .replaceAll('{{order_number}}', args.orderNumber)
      .replaceAll('{{base_url}}', process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr');

  return sendEmail({
    to: args.to,
    subject: interpolate(settings.subject_template),
    react: renderOrderCancelledEmail({
      greeting: interpolate(settings.greeting),
      body: interpolate(settings.body_text),
      ctaText: settings.cta_text,
      ctaUrl: interpolate(settings.cta_url),
      signoff: settings.signoff,
    }),
  });
}
```

- [ ] **Step 4.2.5: Apply the same refactor to `order-refunded.ts`**

Signature: `{ to, firstName, orderNumber, refundAmount }`. Interpolation extends with `{{refund_amount}}`.

- [ ] **Step 4.2.6: Run tests**

Run: `pnpm test __tests__/email/`
Expected: all green.

- [ ] **Step 4.2.7: Type-check**

Run: `pnpm tsc --noEmit`
Expected: no new errors.

### Step 4.3 — Register templates in admin UI

- [ ] **Step 4.3.1: Read the emails admin page**

Run: `grep -n "template_key\|order_confirmation" lolett-app/app/admin/emails/page.tsx`

- [ ] **Step 4.3.2: Add the two template keys to the list/tabs**

Locate the array/constant listing template keys and add:

```ts
{ key: 'order_cancelled', label: 'Commande annulée' },
{ key: 'order_refunded', label: 'Commande remboursée' },
```

Alphabetize if the file does so already.

### Step 4.4 — Verify end-to-end

- [ ] **Step 4.4.1: Start dev server and open admin**

Run (separate shell): `PORT=3001 pnpm dev`
Open: `http://localhost:3001/admin/emails`
Expected: two new tabs "Commande annulée" / "Commande remboursée" with editable fields. Edit the body, save, reopen — change persists.

- [ ] **Step 4.4.2: Commit**

```bash
git add lolett-app/supabase/migrations/20260424120000_seed_cancel_refund_email_settings.sql \
        lolett-app/lib/email/order-cancelled.ts \
        lolett-app/lib/email/order-refunded.ts \
        lolett-app/app/admin/emails/page.tsx \
        lolett-app/__tests__/email/order-cancelled.test.ts
git commit -m "feat(cms-emails): order_cancelled + order_refunded éditables via admin"
git push origin preview
```

---

## Task 5 — Low-Stock Dashboard Widget + Sold-Out Ordering

**Context:** The product-variants trigger already keeps `products.stock = SUM(variants.stock)`. We need (a) a dashboard widget that surfaces variants approaching zero so Lola can restock proactively, and (b) ensure the public shop lists sold-out items last (rather than hiding — brand prefers visibility with "Victime de son succès" badge).

**Files:**
- Create: `lolett-app/lib/admin/low-stock.ts`
- Create: `lolett-app/components/admin/dashboard/LowStockWidget.tsx`
- Modify: `lolett-app/app/admin/page.tsx`
- Modify: `lolett-app/lib/constants.ts` (confirm `STOCK.LOW_THRESHOLD`)
- Modify: `lolett-app/app/shop/page.tsx` (or the adapter that loads the grid)
- Create: `lolett-app/__tests__/admin/low-stock.test.ts`

### Step 5.1 — Low-stock query

- [ ] **Step 5.1.1: Confirm LOW_THRESHOLD value**

Run: `grep -n "LOW_THRESHOLD" lolett-app/lib/constants.ts`
Expected: a numeric constant exists. If < 3, bump to 3. If missing, add `export const STOCK = { LOW_THRESHOLD: 3 } as const;`.

- [ ] **Step 5.1.2: Write the failing test**

Create `lolett-app/__tests__/admin/low-stock.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';

const mockRpc = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        lte: () => ({
          gt: () => ({
            order: () => ({
              limit: () =>
                Promise.resolve({
                  data: [
                    { product_id: 'p1', product_name: 'Isa Marron', color_name: 'Marron', size: 'L', stock: 2 },
                  ],
                  error: null,
                }),
            }),
          }),
        }),
      }),
    }),
  }),
  __mockRpc: mockRpc,
}));

import { getLowStockVariants } from '@/lib/admin/low-stock';

describe('getLowStockVariants', () => {
  it('returns variants with 0 < stock <= threshold', async () => {
    const rows = await getLowStockVariants(3);
    expect(rows).toHaveLength(1);
    expect(rows[0].stock).toBeLessThanOrEqual(3);
  });
});
```

- [ ] **Step 5.1.3: Run — expect failure**

Run: `pnpm test __tests__/admin/low-stock.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 5.1.4: Implement `lib/admin/low-stock.ts`**

```ts
import { createAdminClient } from '@/lib/supabase/admin';

export interface LowStockVariant {
  product_id: string;
  product_name: string;
  product_slug: string;
  color_name: string;
  size: string;
  stock: number;
}

export async function getLowStockVariants(threshold: number): Promise<LowStockVariant[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('product_variants')
    .select('product_id, color_name, size, stock, products!inner(name, slug)')
    .lte('stock', threshold)
    .gt('stock', 0)
    .order('stock', { ascending: true })
    .limit(50);

  if (error || !data) return [];

  return data.map((row: any) => ({
    product_id: row.product_id,
    product_name: row.products.name,
    product_slug: row.products.slug,
    color_name: row.color_name,
    size: row.size,
    stock: row.stock,
  }));
}

export async function getOutOfStockVariants(): Promise<LowStockVariant[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('product_variants')
    .select('product_id, color_name, size, stock, products!inner(name, slug)')
    .eq('stock', 0)
    .limit(50);

  if (error || !data) return [];

  return data.map((row: any) => ({
    product_id: row.product_id,
    product_name: row.products.name,
    product_slug: row.products.slug,
    color_name: row.color_name,
    size: row.size,
    stock: 0,
  }));
}
```

- [ ] **Step 5.1.5: Run — expect pass**

Run: `pnpm test __tests__/admin/low-stock.test.ts`
Expected: PASS.

### Step 5.2 — Dashboard widget

- [ ] **Step 5.2.1: Create `LowStockWidget.tsx`**

```tsx
import Link from 'next/link';
import { AlertTriangle, PackageX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getLowStockVariants, getOutOfStockVariants } from '@/lib/admin/low-stock';
import { STOCK } from '@/lib/constants';

export async function LowStockWidget() {
  const [low, out] = await Promise.all([
    getLowStockVariants(STOCK.LOW_THRESHOLD),
    getOutOfStockVariants(),
  ]);

  if (low.length === 0 && out.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white border border-orange-200/60 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#1a1510]">
          <AlertTriangle className="size-4 text-orange-600" />
          Stock à surveiller
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {out.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-red-700 mb-2">
              <PackageX className="size-3.5" />
              Épuisés ({out.length})
            </div>
            <ul className="space-y-1 text-sm">
              {out.slice(0, 6).map((v) => (
                <li key={`${v.product_id}-${v.color_name}-${v.size}`}>
                  <Link
                    href={`/admin/products/${v.product_id}/edit`}
                    className="text-[#1B0B94] hover:underline"
                  >
                    {v.product_name} — {v.color_name} / {v.size}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {low.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-orange-700 mb-2">
              Stock bas (≤{STOCK.LOW_THRESHOLD})
            </div>
            <ul className="space-y-1 text-sm">
              {low.slice(0, 8).map((v) => (
                <li key={`${v.product_id}-${v.color_name}-${v.size}`} className="flex justify-between">
                  <Link
                    href={`/admin/products/${v.product_id}/edit`}
                    className="text-[#1B0B94] hover:underline"
                  >
                    {v.product_name} — {v.color_name} / {v.size}
                  </Link>
                  <span className="text-orange-600 font-medium">{v.stock}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5.2.2: Mount in admin dashboard**

Open `lolett-app/app/admin/page.tsx`. Import `LowStockWidget` and render it below the stat cards but above the DashboardCharts:

```tsx
import { LowStockWidget } from '@/components/admin/dashboard/LowStockWidget';
// …
<Suspense fallback={null}>
  <LowStockWidget />
</Suspense>
```

- [ ] **Step 5.2.3: Visual smoke test**

Run: `PORT=3001 pnpm dev` (in separate shell)
Open: `http://localhost:3001/admin`
Expected: "Stock à surveiller" card visible if any variant has stock ≤ 3. Links go to the edit page.

### Step 5.3 — Shop listing: sold-out last

- [ ] **Step 5.3.1: Locate shop grid query**

Run: `grep -rn "productRepository.findAll\|list.*products\|ORDER BY" lolett-app/app/shop lolett-app/lib/adapters 2>/dev/null | head -10`

- [ ] **Step 5.3.2: Adjust ordering**

In the product repository query used by `app/shop/page.tsx`, change the Supabase call to order by `stock = 0` ascending (false=0 sorts before true=1 in Postgres booleans, so in-stock first), then by `created_at desc`:

```ts
.from('products')
.select('...')
.eq('is_active', true)
.order('stock', { ascending: false })   // > 0 first
.order('created_at', { ascending: false });
```

Simpler: if the query already uses `stock > 0 DESC`, that works. Document the order explicitly in a comment line.

- [ ] **Step 5.3.3: Verify**

Reload `http://localhost:3001/shop` — any product with `stock=0` should be at the end of the grid.

### Step 5.4 — Commit and push

- [ ] **Step 5.4.1: Commit**

```bash
git add lolett-app/lib/admin/low-stock.ts \
        lolett-app/components/admin/dashboard/LowStockWidget.tsx \
        lolett-app/app/admin/page.tsx \
        lolett-app/__tests__/admin/low-stock.test.ts \
        lolett-app/lib/constants.ts \
        lolett-app/app/shop/page.tsx
git commit -m "feat(admin): widget stock bas + épuisés, shop trie sold-out en dernier"
git push origin preview
```

---

## Task 6 — Sentry Error Monitoring

**Context:** No error tracking is wired today. A prod incident would be invisible until a user reports it. Sentry gives us client + server + edge capture with ~5min setup. Use the Sentry wizard or the manual `@sentry/nextjs` install. We'll use the manual path to avoid the wizard modifying unexpected files.

**Files:**
- Install: `@sentry/nextjs`
- Create: `lolett-app/sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Modify: `lolett-app/next.config.ts`
- Create/modify: `lolett-app/instrumentation.ts`
- Modify: `.env.example`
- Create: `lolett-app/app/api/_sentry-test/route.ts`

### Step 6.1 — Install SDK

- [ ] **Step 6.1.1: Install**

Run (in `lolett-app/`): `pnpm add @sentry/nextjs`

- [ ] **Step 6.1.2: Verify install**

Run: `grep sentry lolett-app/package.json`
Expected: `"@sentry/nextjs": "^9.x.x"` or later.

### Step 6.2 — Sentry config files

- [ ] **Step 6.2.1: `sentry.client.config.ts`**

Create `lolett-app/sentry.client.config.ts`:

```ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false })],
  enabled: process.env.NODE_ENV === 'production',
});
```

- [ ] **Step 6.2.2: `sentry.server.config.ts`**

Create `lolett-app/sentry.server.config.ts`:

```ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === 'production',
});
```

- [ ] **Step 6.2.3: `sentry.edge.config.ts`**

Create `lolett-app/sentry.edge.config.ts`:

```ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === 'production',
});
```

- [ ] **Step 6.2.4: `instrumentation.ts`**

Create (or edit) `lolett-app/instrumentation.ts`:

```ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export { captureRequestError as onRequestError } from '@sentry/nextjs';
```

- [ ] **Step 6.2.5: Wrap `next.config.ts`**

Open `lolett-app/next.config.ts`. Append at the bottom:

```ts
import { withSentryConfig } from '@sentry/nextjs';

// … existing config object …

export default withSentryConfig(config, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: false,
});
```

(Adjust to wrap whatever the current default export is — the existing config must be wrapped.)

### Step 6.3 — Env vars

- [ ] **Step 6.3.1: Document in `.env.example`**

Add to `lolett-app/.env.example`:

```
# Sentry — error + performance monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
SENTRY_ORG=lolett
SENTRY_PROJECT=lolett-app
SENTRY_AUTH_TOKEN=
```

- [ ] **Step 6.3.2: Add to Vercel**

Run (in repo root):

```bash
vercel env add NEXT_PUBLIC_SENTRY_DSN production
vercel env add NEXT_PUBLIC_SENTRY_DSN preview
vercel env add SENTRY_DSN production
vercel env add SENTRY_DSN preview
vercel env add SENTRY_AUTH_TOKEN production
```

(Values: created when Lola or we set up the Sentry project — see Step 6.5 below. For now, leave blank; deploys will skip Sentry since `enabled` is gated on `NODE_ENV === 'production'`.)

### Step 6.4 — Test endpoint

- [ ] **Step 6.4.1: Create deliberate-error route**

Create `lolett-app/app/api/_sentry-test/route.ts`:

```ts
import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.json({ error: 'disabled outside prod' }, { status: 403 });
  }
  throw new Error('Sentry test — this error is intentional.');
}
```

- [ ] **Step 6.4.2: Type-check + build**

Run: `pnpm tsc --noEmit && pnpm build`
Expected: build succeeds. If it fails because of missing Sentry env vars, the build may warn but should not error (Sentry SDK is defensive).

### Step 6.5 — Sentry project setup (manual, documented)

- [ ] **Step 6.5.1: Document in `docs/operations/sentry-setup.md`**

Create a short ops doc explaining how to:
1. Sign up at https://sentry.io, create org `lolett`, project `lolett-app` (Next.js platform).
2. Copy DSN → set both `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN`.
3. Create an auth token with `project:releases` + `org:read` scopes → `SENTRY_AUTH_TOKEN`.
4. Redeploy.
5. Hit `https://lolett.vercel.app/api/_sentry-test` — event should land in Sentry within 1 min.

### Step 6.6 — Commit and push

- [ ] **Step 6.6.1: Commit**

```bash
git add lolett-app/sentry.*.config.ts \
        lolett-app/instrumentation.ts \
        lolett-app/next.config.ts \
        lolett-app/package.json lolett-app/pnpm-lock.yaml \
        lolett-app/.env.example \
        lolett-app/app/api/_sentry-test/route.ts \
        lolett-app/docs/operations/sentry-setup.md
git commit -m "feat(monitoring): Sentry error tracking (client + server + edge)"
git push origin preview
```

---

## Task 7 — Newsletter Wiring (Resend Audiences + DB Fallback)

**Context:** Three components render a newsletter input (`home-v3/NewsletterSection`, `editorial/NewsletterForm`, `contact/ContactNewsletter`) but none submit. Resend is already in deps and Resend Audiences have a simple API. We'll also store subscribers in a DB table as a fallback so the list isn't locked into Resend.

**Files:**
- Create: `lolett-app/supabase/migrations/20260424130000_newsletter_subscribers.sql`
- Create: `lolett-app/app/api/newsletter/subscribe/route.ts`
- Modify: 3 newsletter UI components
- Modify: `.env.example`
- Create: `lolett-app/__tests__/api/newsletter-subscribe.test.ts`

### Step 7.1 — DB table

- [ ] **Step 7.1.1: Write the migration**

Create `lolett-app/supabase/migrations/20260424130000_newsletter_subscribers.sql`:

```sql
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  consent_at timestamptz not null default now(),
  source text not null default 'home',
  resend_contact_id text,
  unsubscribed_at timestamptz
);

create index if not exists idx_newsletter_subscribers_email
  on public.newsletter_subscribers (email);

alter table public.newsletter_subscribers enable row level security;

-- Only service_role may read/write (anon does so via API route with service key)
create policy "service only"
  on public.newsletter_subscribers
  for all
  using (false);
```

Requires `citext` extension: add at the top `create extension if not exists citext;`.

- [ ] **Step 7.1.2: Apply via Supabase MCP**

Apply with `mcp__claude_ai_Supabase__apply_migration`.

### Step 7.2 — API route

- [ ] **Step 7.2.1: Write failing test**

Create `lolett-app/__tests__/api/newsletter-subscribe.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      upsert: vi.fn().mockResolvedValue({ data: { id: 'uuid-1' }, error: null }),
    }),
  }),
}));

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    contacts: { create: vi.fn().mockResolvedValue({ data: { id: 'res-1' } }) },
  })),
}));

vi.mock('@/lib/email/order-confirmation', () => ({}));
vi.mock('@/lib/email/welcome-newsletter', () => ({
  sendWelcomeNewsletterEmail: vi.fn().mockResolvedValue({ success: true }),
}));

import { POST } from '@/app/api/newsletter/subscribe/route';

describe('POST /api/newsletter/subscribe', () => {
  it('rejects malformed email', async () => {
    const req = new Request('http://x/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('accepts valid email and returns 200', async () => {
    const req = new Request('http://x/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'camille@ex.fr', source: 'home' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 7.2.2: Run — expect failure**

Run: `pnpm test __tests__/api/newsletter-subscribe.test.ts`
Expected: FAIL — route does not exist.

- [ ] **Step 7.2.3: Implement route**

Create `lolett-app/app/api/newsletter/subscribe/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWelcomeNewsletterEmail } from '@/lib/email/welcome-newsletter';

const schema = z.object({
  email: z.string().email(),
  source: z.enum(['home', 'editorial', 'contact', 'footer']).optional().default('home'),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const { email, source } = parsed.data;
  const supabase = createAdminClient();

  let resendContactId: string | null = null;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (audienceId && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data } = await resend.contacts.create({ email, audienceId, unsubscribed: false });
      resendContactId = data?.id ?? null;
    } catch {
      /* swallow; DB row still written */
    }
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert(
      { email, source, resend_contact_id: resendContactId },
      { onConflict: 'email', ignoreDuplicates: false },
    );

  if (error) {
    return NextResponse.json({ error: 'Storage error' }, { status: 500 });
  }

  // Fire-and-forget welcome email
  sendWelcomeNewsletterEmail({ to: email }).catch(() => {});

  return NextResponse.json({ ok: true });
}
```

Create `lolett-app/lib/email/welcome-newsletter.ts` if it doesn't exist (wrapping `welcome-newsletter-v3.ts`). Use the same structure as `order-confirmation.ts`.

- [ ] **Step 7.2.4: Run — expect pass**

Run: `pnpm test __tests__/api/newsletter-subscribe.test.ts`
Expected: PASS.

### Step 7.3 — Wire up the 3 UI components

- [ ] **Step 7.3.1: `components/sections/home-v3/NewsletterSection.tsx`**

Find the `<form>` element. Add state:

```tsx
const [email, setEmail] = useState('');
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  setStatus('loading');
  const res = await fetch('/api/newsletter/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source: 'home' }),
  });
  setStatus(res.ok ? 'success' : 'error');
}
```

Swap the form onto `onSubmit`, bind `email` to the input. Show success/error copy in place of the submit button when appropriate.

- [ ] **Step 7.3.2: Same wiring for `editorial/NewsletterForm.tsx` (source='editorial') and `contact/ContactNewsletter.tsx` (source='contact')**

- [ ] **Step 7.3.3: Env var**

Add to `.env.example`:
```
RESEND_API_KEY=
RESEND_AUDIENCE_ID=
```

### Step 7.4 — Commit and push

- [ ] **Step 7.4.1: Commit**

```bash
git add lolett-app/supabase/migrations/20260424130000_newsletter_subscribers.sql \
        lolett-app/app/api/newsletter/subscribe/route.ts \
        lolett-app/lib/email/welcome-newsletter.ts \
        lolett-app/components/sections/home-v3/NewsletterSection.tsx \
        lolett-app/components/editorial/NewsletterForm.tsx \
        lolett-app/components/contact/ContactNewsletter.tsx \
        lolett-app/__tests__/api/newsletter-subscribe.test.ts \
        lolett-app/.env.example
git commit -m "feat(newsletter): wire subscribe form → DB + Resend Audiences + welcome email"
git push origin preview
```

---

## Task 8 — Schema.org JSON-LD on Product Pages

**Context:** Product pages don't emit Product JSON-LD, which limits Google rich-result eligibility (price, availability, ratings badge). We'll add a single `<script type="application/ld+json">` in the product page with Product + Offer schema.

**Files:**
- Create: `lolett-app/lib/seo/product-jsonld.ts`
- Modify: `lolett-app/app/produit/[slug]/page.tsx`
- Create: `lolett-app/__tests__/seo/product-jsonld.test.ts`

### Step 8.1 — JSON-LD builder

- [ ] **Step 8.1.1: Write failing test**

Create `lolett-app/__tests__/seo/product-jsonld.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildProductJsonLd } from '@/lib/seo/product-jsonld';

describe('buildProductJsonLd', () => {
  it('emits Product schema with Offer and availability', () => {
    const jsonld = buildProductJsonLd({
      name: 'Isa Marron',
      slug: 'isa-marron',
      description: 'Top crop ajusté',
      images: ['https://cdn/p1.jpg'],
      price: 39,
      currency: 'EUR',
      stock: 15,
      sku: 'ISA-MARRON',
      baseUrl: 'https://lolett.fr',
    });
    expect(jsonld['@type']).toBe('Product');
    expect(jsonld.offers['@type']).toBe('Offer');
    expect(jsonld.offers.price).toBe(39);
    expect(jsonld.offers.availability).toBe('https://schema.org/InStock');
  });

  it('emits OutOfStock availability when stock is 0', () => {
    const jsonld = buildProductJsonLd({
      name: 'X',
      slug: 'x',
      description: '',
      images: [],
      price: 10,
      currency: 'EUR',
      stock: 0,
      sku: 'X',
      baseUrl: 'https://lolett.fr',
    });
    expect(jsonld.offers.availability).toBe('https://schema.org/OutOfStock');
  });
});
```

- [ ] **Step 8.1.2: Run — expect failure**

Run: `pnpm test __tests__/seo/product-jsonld.test.ts`
Expected: FAIL.

- [ ] **Step 8.1.3: Implement builder**

Create `lolett-app/lib/seo/product-jsonld.ts`:

```ts
export interface ProductJsonLdInput {
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  currency: string;
  stock: number;
  sku: string;
  baseUrl: string;
}

export function buildProductJsonLd(input: ProductJsonLdInput) {
  const url = `${input.baseUrl}/produit/${input.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    image: input.images.length > 0 ? input.images : undefined,
    sku: input.sku,
    brand: { '@type': 'Brand', name: 'LOLETT' },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: input.currency,
      price: input.price,
      availability:
        input.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}
```

- [ ] **Step 8.1.4: Run — expect pass**

Run: `pnpm test __tests__/seo/product-jsonld.test.ts`
Expected: PASS.

### Step 8.2 — Inject into product page

- [ ] **Step 8.2.1: Modify product page**

Open `lolett-app/app/produit/[slug]/page.tsx`. In the `ProductPage` function, after `notFound()` handling and before the returned JSX, build the JSON-LD:

```tsx
import { buildProductJsonLd } from '@/lib/seo/product-jsonld';

const jsonLd = buildProductJsonLd({
  name: product.name,
  slug: product.slug,
  description: product.description,
  images: product.images,
  price: product.price,
  currency: 'EUR',
  stock: product.stock,
  sku: product.id,
  baseUrl: BASE_URL,
});
```

Then in the returned JSX, add before the Breadcrumbs:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

- [ ] **Step 8.2.2: Smoke test**

Run: `PORT=3001 pnpm dev`
Open: `http://localhost:3001/produit/isa-marron`
View page source, find `application/ld+json` script — should contain valid Product JSON with offers.price=39.

- [ ] **Step 8.2.3: Validate with Google**

Manual: copy the JSON-LD block and paste into https://validator.schema.org/. Expected: 0 errors, 0 warnings (or at most "recommended property X missing").

### Step 8.3 — Commit and push

- [ ] **Step 8.3.1: Commit**

```bash
git add lolett-app/lib/seo/product-jsonld.ts \
        lolett-app/app/produit/[slug]/page.tsx \
        lolett-app/__tests__/seo/product-jsonld.test.ts
git commit -m "feat(seo): JSON-LD Product schema sur pages produit"
git push origin preview
```

---

## Task 9 — Automated Supabase Backup (Vercel Cron)

**Context:** Lola's Supabase is on the Free plan (no automated backups). We write a daily cron that exports critical tables to Vercel Blob with 30-day retention, giving us a restorable snapshot even if the Supabase project is deleted.

**Files:**
- Create: `lolett-app/app/api/cron/backup/route.ts`
- Create/modify: `lolett-app/vercel.json`
- Modify: `.env.example`
- Create: `lolett-app/__tests__/api/cron-backup.test.ts`

### Step 9.1 — Cron endpoint

- [ ] **Step 9.1.1: Install `@vercel/blob`**

Run: `pnpm add @vercel/blob`

- [ ] **Step 9.1.2: Write failing test**

Create `lolett-app/__tests__/api/cron-backup.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('@vercel/blob', () => ({
  put: vi.fn().mockResolvedValue({ url: 'https://blob.vercel-storage.com/backup.json' }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: () => Promise.resolve({ data: [{ table, id: '1' }], error: null }),
    }),
  }),
}));

import { GET } from '@/app/api/cron/backup/route';

describe('GET /api/cron/backup', () => {
  it('rejects unauthorized requests', async () => {
    const req = new Request('http://x/api/cron/backup', {
      headers: {},
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 200 with valid cron secret', async () => {
    const req = new Request('http://x/api/cron/backup', {
      headers: { authorization: `Bearer test-secret` },
    });
    process.env.CRON_SECRET = 'test-secret';
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 9.1.3: Run — expect failure**

Run: `pnpm test __tests__/api/cron-backup.test.ts`
Expected: FAIL.

- [ ] **Step 9.1.4: Implement route**

Create `lolett-app/app/api/cron/backup/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createAdminClient } from '@/lib/supabase/admin';

const BACKUP_TABLES = [
  'products',
  'product_variants',
  'categories',
  'orders',
  'order_items',
  'looks',
  'materials',
  'promos',
  'site_content',
  'email_settings',
  'newsletter_subscribers',
] as const;

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const snapshot: Record<string, unknown[]> = {};
  for (const table of BACKUP_TABLES) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      return NextResponse.json({ error: `Failed to read ${table}: ${error.message}` }, { status: 500 });
    }
    snapshot[table] = data ?? [];
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `backups/lolett-${timestamp}.json`;

  const { url } = await put(filename, JSON.stringify(snapshot, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return NextResponse.json({
    ok: true,
    url,
    rows: Object.fromEntries(
      Object.entries(snapshot).map(([t, rows]) => [t, rows.length]),
    ),
  });
}
```

- [ ] **Step 9.1.5: Run — expect pass**

Run: `pnpm test __tests__/api/cron-backup.test.ts`
Expected: PASS.

### Step 9.2 — Vercel Cron registration

- [ ] **Step 9.2.1: Create or update `vercel.json`**

Create `lolett-app/vercel.json` (or the root `vercel.json` if the project deploys from root; check `.vercel/project.json` for `rootDirectory`):

```json
{
  "crons": [
    {
      "path": "/api/cron/backup",
      "schedule": "0 3 * * *"
    }
  ]
}
```

Vercel will automatically inject `Authorization: Bearer $CRON_SECRET` when hitting registered cron endpoints, as long as the env var `CRON_SECRET` is set on the project.

- [ ] **Step 9.2.2: Set env vars on Vercel**

Run (from repo root):

```bash
CRON_SECRET_VALUE=$(openssl rand -hex 32)
echo "CRON_SECRET=$CRON_SECRET_VALUE"
# Save this value — you'll need it.
vercel env add CRON_SECRET production <<< "$CRON_SECRET_VALUE"
vercel env add CRON_SECRET preview <<< "$CRON_SECRET_VALUE"
```

And the Vercel Blob token is auto-provisioned once you enable the Blob store in the Vercel dashboard → Storage → Create Blob store.

### Step 9.3 — Env docs

- [ ] **Step 9.3.1: Update `.env.example`**

Add:

```
# Vercel Cron backup
CRON_SECRET=
BLOB_READ_WRITE_TOKEN=
```

### Step 9.4 — Commit and push

- [ ] **Step 9.4.1: Commit**

```bash
git add lolett-app/app/api/cron/backup/route.ts \
        lolett-app/__tests__/api/cron-backup.test.ts \
        lolett-app/vercel.json \
        lolett-app/.env.example \
        lolett-app/package.json lolett-app/pnpm-lock.yaml
git commit -m "feat(backup): cron quotidien export Supabase → Vercel Blob"
git push origin preview
```

---

## Final verification (after all 7 tasks land)

- [ ] **Run the full test suite**

Run: `cd lolett-app && pnpm test && pnpm tsc --noEmit && pnpm build`
Expected: all tests green, no type errors, build succeeds.

- [ ] **Deploy preview and smoke-test**

The Vercel preview auto-deploys on each push to `preview`. Once the latest preview builds:
1. `/connexion` — clicks "Mot de passe oublié ?" → form loads
2. `/admin/emails` — two new tabs "Commande annulée" / "Commande remboursée"
3. `/admin` — "Stock à surveiller" card renders (or cleanly hidden if no low-stock variants)
4. `/produit/isa-marron` — view source, confirm JSON-LD script tag
5. Homepage newsletter submit → success state; row appears in `newsletter_subscribers`
6. `/api/_sentry-test` in prod → Sentry dashboard receives the error within 1 min
7. Backup blob visible at `https://<project>.public.blob.vercel-storage.com/backups/lolett-YYYY-MM-DD.json` after first cron run (or manual GET with CRON_SECRET header)

- [ ] **Merge to `main`**

Once Lola validates the preview:

```bash
git checkout main
git pull origin main
git merge preview --no-ff -m "Merge preview — launch readiness tasks 3–9"
git push origin main
```

---

## Risks and open questions

- **Sentry project creation** must be done by a human (Lola or you) in the Sentry dashboard. Until the DSN is set, `enabled: NODE_ENV === 'production'` in the configs means Sentry silently does nothing — no deploy risk.
- **Resend Audiences** requires a free Audience created in the Resend dashboard. Until `RESEND_AUDIENCE_ID` is set, subscribers still land in the DB table (fallback); only the Resend sync is skipped.
- **Vercel Blob**: requires the Blob store to be enabled in the Vercel dashboard (free tier: 1 GB). The cron will error on first run if not enabled; docs the ops team.
- **CRON_SECRET**: if not set, Vercel crons will still fire but the endpoint returns 401, which is the desired fail-safe.
- **Newsletter welcome email**: `welcome-newsletter-v3.ts` template exists (`lib/email/templates/`). Check it's already wired through `email_settings.template_key='welcome_newsletter'` or add a seed migration if missing.

## Execution order

The 7 tasks are fully independent in terms of files modified. Recommended parallel execution:

- **Group A** (files only): Task 6 (Sentry), Task 8 (Schema.org), Task 9 (Backup) — zero overlap with other groups.
- **Group B** (auth): Task 3 (Reset password) — touches only `auth/` components.
- **Group C** (email/CMS): Task 4 (CMS templates). Touches `lib/email/` and `lib/cms/`.
- **Group D** (product/admin): Task 5 (Low-stock). Touches admin + shop.
- **Group E** (newsletter): Task 7. Touches 3 isolated UI components + new API route + DB.

All 5 groups can run in parallel. Merge conflicts risk: minimal — only `.env.example` and `package.json` could overlap. Sequence the final commits so each group resolves its own `.env.example` additions.
