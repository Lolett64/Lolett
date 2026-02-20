# Admin CMS + Email Management — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow the site owner to edit all visible content (images, texts, banners) and email templates from the admin panel, with versioning/history.

**Architecture:** Three new Supabase tables (`site_content`, `email_settings`, `content_history`). New admin pages `/admin/contenu` and `/admin/emails`. Front-end components fetch content via `getSiteContent()` helper with ISR cache. Email functions fetch settings from DB instead of hardcoded values.

**Tech Stack:** Next.js 15 App Router, Supabase (admin client), Resend, Tailwind 4, shadcn/ui

---

## Task 1: Database Migrations

**Files:**
- Create: `supabase/migrations/20250220200001_create_site_content.sql`
- Create: `supabase/migrations/20250220200002_create_email_settings.sql`
- Create: `supabase/migrations/20250220200003_create_content_history.sql`

**Step 1: Create `site_content` migration**

```sql
-- supabase/migrations/20250220200001_create_site_content.sql
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'textarea', 'image', 'url', 'video')),
  label TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(section, key)
);

CREATE INDEX idx_site_content_section ON site_content(section);
```

**Step 2: Create `email_settings` migration**

```sql
-- supabase/migrations/20250220200002_create_email_settings.sql
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  from_name TEXT NOT NULL DEFAULT 'LOLETT',
  from_email TEXT NOT NULL DEFAULT 'onboarding@resend.dev',
  subject_template TEXT NOT NULL,
  greeting TEXT NOT NULL DEFAULT '',
  body_text TEXT NOT NULL DEFAULT '',
  cta_text TEXT NOT NULL DEFAULT '',
  cta_url TEXT NOT NULL DEFAULT '',
  signoff TEXT NOT NULL DEFAULT 'Avec amour, LOLETT ♥',
  extra_params JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Step 3: Create `content_history` migration**

```sql
-- supabase/migrations/20250220200003_create_content_history.sql
CREATE TABLE IF NOT EXISTS content_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL CHECK (table_name IN ('site_content', 'email_settings')),
  record_id UUID NOT NULL,
  previous_value JSONB NOT NULL,
  changed_by TEXT NOT NULL DEFAULT 'admin',
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_history_record ON content_history(table_name, record_id);
CREATE INDEX idx_content_history_date ON content_history(changed_at DESC);
```

**Step 4: Push migrations to Supabase**

Run: `cd lolett-app && npx supabase db push`
Expected: 3 migrations applied successfully

**Step 5: Commit**

```bash
git add supabase/migrations/20250220200001_create_site_content.sql supabase/migrations/20250220200002_create_email_settings.sql supabase/migrations/20250220200003_create_content_history.sql
git commit -m "feat(db): add site_content, email_settings, content_history tables"
```

---

## Task 2: Seed Data — Site Content

**Files:**
- Create: `supabase/migrations/20250220200004_seed_site_content.sql`

**Step 1: Create seed migration with all current hardcoded values**

This migration inserts all current hardcoded content into `site_content`. Sections:

- `hero`: badge, title, subtitle, video_url, cta_femme, cta_homme
- `collections`: titre_femme, image_femme, titre_homme, image_homme
- `brand_story`: quote, quote_author, pillar_1_title, pillar_1_desc, pillar_2_title, pillar_2_desc, pillar_3_title, pillar_3_desc
- `newsletter`: title, subtitle, description, discount_text, button_text, disclaimer
- `trust_bar`: message_1, message_2, message_3
- `contact`: email, phone, address, faq_1_q, faq_1_a, faq_2_q, faq_2_a, faq_3_q, faq_3_a, faq_4_q, faq_4_a
- `footer`: tagline, instagram_url, tiktok_url, facebook_url, email, credit_text
- `notre_histoire`: hero_title, hero_subtitle, origine_title, origine_text, vision_title, vision_text, mediterranee_title, mediterranee_text, hero_image, vision_image

Each INSERT must include: section, key, value (current hardcoded text), type, label (FR), sort_order.

Read each component file to extract exact current values.

**Step 2: Push migration**

Run: `cd lolett-app && npx supabase db push`

**Step 3: Commit**

```bash
git add supabase/migrations/20250220200004_seed_site_content.sql
git commit -m "feat(db): seed site_content with current hardcoded values"
```

---

## Task 3: Seed Data — Email Settings

**Files:**
- Create: `supabase/migrations/20250220200005_seed_email_settings.sql`

**Step 1: Create seed migration for email templates**

Insert rows for:
- `order_confirmation`: from current `lib/email/order-confirmation.ts` and `lib/email/templates/order-confirmation-v3.ts`
- `welcome_newsletter`: from current `lib/email/templates/welcome-newsletter-v3.ts`

Extract: from_name, from_email, subject_template, greeting, body_text, cta_text, cta_url, signoff, extra_params (discount %, promo duration, etc.)

**Step 2: Push and commit**

```bash
cd lolett-app && npx supabase db push
git add supabase/migrations/20250220200005_seed_email_settings.sql
git commit -m "feat(db): seed email_settings with current template values"
```

---

## Task 4: CMS Helper — `getSiteContent()`

**Files:**
- Create: `lib/cms/content.ts`

**Step 1: Create the CMS content helper**

```typescript
// lib/cms/content.ts
import { createAdminClient } from '@/lib/supabase/admin';

export interface SiteContentItem {
  id: string;
  section: string;
  key: string;
  value: string;
  type: 'text' | 'textarea' | 'image' | 'url' | 'video';
  label: string;
  sort_order: number;
}

// Fetch all content for a section, returns a key-value map
export async function getSiteContent(section: string): Promise<Record<string, string>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('site_content')
    .select('key, value')
    .eq('section', section)
    .order('sort_order');

  if (error || !data) return {};
  return Object.fromEntries(data.map(row => [row.key, row.value]));
}

// Fetch all content items for a section (full objects, for admin)
export async function getSiteContentItems(section: string): Promise<SiteContentItem[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('section', section)
    .order('sort_order');

  return data || [];
}

// Get all sections
export async function getAllSections(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('site_content')
    .select('section')
    .order('section');

  if (!data) return [];
  return [...new Set(data.map(row => row.section))];
}
```

**Step 2: Commit**

```bash
git add lib/cms/content.ts
git commit -m "feat: add getSiteContent CMS helper"
```

---

## Task 5: Email Settings Helper

**Files:**
- Create: `lib/cms/emails.ts`

**Step 1: Create the email settings helper**

```typescript
// lib/cms/emails.ts
import { createAdminClient } from '@/lib/supabase/admin';

export interface EmailSettings {
  id: string;
  template_key: string;
  label: string;
  from_name: string;
  from_email: string;
  subject_template: string;
  greeting: string;
  body_text: string;
  cta_text: string;
  cta_url: string;
  signoff: string;
  extra_params: Record<string, unknown>;
}

export async function getEmailSettings(templateKey: string): Promise<EmailSettings | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('email_settings')
    .select('*')
    .eq('template_key', templateKey)
    .single();

  return data || null;
}

export async function getAllEmailSettings(): Promise<EmailSettings[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('email_settings')
    .select('*')
    .order('template_key');

  return data || [];
}
```

**Step 2: Commit**

```bash
git add lib/cms/emails.ts
git commit -m "feat: add email settings helper"
```

---

## Task 6: History Helper

**Files:**
- Create: `lib/cms/history.ts`

**Step 1: Create the history/versioning helper**

```typescript
// lib/cms/history.ts
import { createAdminClient } from '@/lib/supabase/admin';

export interface HistoryEntry {
  id: string;
  table_name: string;
  record_id: string;
  previous_value: Record<string, unknown>;
  changed_by: string;
  changed_at: string;
}

export async function saveHistory(
  tableName: 'site_content' | 'email_settings',
  recordId: string,
  previousValue: Record<string, unknown>,
  changedBy: string = 'admin'
) {
  const supabase = createAdminClient();
  await supabase.from('content_history').insert({
    table_name: tableName,
    record_id: recordId,
    previous_value: previousValue,
    changed_by: changedBy,
  });
}

export async function getHistory(
  tableName: 'site_content' | 'email_settings',
  recordId: string
): Promise<HistoryEntry[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('content_history')
    .select('*')
    .eq('table_name', tableName)
    .eq('record_id', recordId)
    .order('changed_at', { ascending: false })
    .limit(50);

  return data || [];
}
```

**Step 2: Commit**

```bash
git add lib/cms/history.ts
git commit -m "feat: add content history/versioning helper"
```

---

## Task 7: API Routes — Content CRUD

**Files:**
- Create: `app/api/admin/content/route.ts`
- Create: `app/api/admin/content/[id]/route.ts`

**Step 1: Create GET/PUT routes for site content**

`route.ts` — GET: fetch all content grouped by section. Used by admin page.

`[id]/route.ts` — PUT: update a single content item. Saves history before updating. PATCH bulk: update multiple items in a section at once.

Both routes check admin auth via `isAdminAuthenticated()` from `lib/admin/auth.ts`.

The PUT handler:
1. Fetch current record (for history)
2. Insert into `content_history`
3. Update `site_content` with new value + `updated_at = now()`
4. Return updated record

**Step 2: Commit**

```bash
git add app/api/admin/content/route.ts app/api/admin/content/[id]/route.ts
git commit -m "feat: add admin content API routes with history"
```

---

## Task 8: API Routes — Email Settings CRUD

**Files:**
- Create: `app/api/admin/emails/route.ts`
- Create: `app/api/admin/emails/[id]/route.ts`
- Create: `app/api/admin/emails/preview/route.ts`
- Create: `app/api/admin/emails/test/route.ts`

**Step 1: CRUD routes for email settings**

`route.ts` — GET all email settings.
`[id]/route.ts` — GET one, PUT update (with history).

**Step 2: Preview route**

`preview/route.ts` — POST: receives template_key + overrides, generates the HTML using the existing render functions (`renderOrderConfirmationV3`, etc.) but with the provided settings values instead of hardcoded ones. Returns HTML string.

**Step 3: Test send route**

`test/route.ts` — POST: receives template_key + recipient email. Generates HTML with current settings, sends via Resend to the provided email.

**Step 4: Commit**

```bash
git add app/api/admin/emails/
git commit -m "feat: add admin email settings API routes with preview and test send"
```

---

## Task 9: API Route — History

**Files:**
- Create: `app/api/admin/history/route.ts`

**Step 1: Create history API**

GET `?table=site_content&record_id=xxx` → returns history entries.
POST (restore) `{ historyId }` → reads the `previous_value` from history, updates the original record, saves new history entry.

**Step 2: Commit**

```bash
git add app/api/admin/history/route.ts
git commit -m "feat: add admin history API route with restore"
```

---

## Task 10: Admin Page — `/admin/contenu`

**Files:**
- Create: `app/admin/contenu/page.tsx`

**Step 1: Build the CMS content management page**

Design (inspired by front-end UX):
- Page title "Contenu du site" with Playfair Display
- Accordion sections (Hero, Collections, Brand Story, Newsletter, Trust Bar, Contact, Footer, Notre Histoire)
- Each section opens to show its fields:
  - `text` → Input field
  - `textarea` → Textarea
  - `image` / `video` → Drag & drop upload zone with current preview (use existing `/api/admin/upload` route)
  - `url` → Input with link icon
- "Enregistrer" button per section (blue #2418a6)
- "Modifié" badge (orange) if unsaved changes
- History icon (clock) per section → opens drawer with timeline

Use shadcn/ui components: Accordion, Input, Textarea, Button, Badge, Card.
Use existing admin layout (sidebar already exists via `app/admin/layout.tsx`).

**Step 2: Add sidebar link**

Modify: `components/admin/AdminSidebar.tsx` — add "Contenu" link with FileText icon pointing to `/admin/contenu`.

**Step 3: Commit**

```bash
git add app/admin/contenu/ components/admin/AdminSidebar.tsx
git commit -m "feat: add admin content management page"
```

---

## Task 11: Content Image Upload Component

**Files:**
- Create: `components/admin/ContentImageUpload.tsx`

**Step 1: Build drag & drop image upload component**

- Drop zone with dashed border
- Current image preview
- Click to browse or drag & drop
- Uploads to `/api/admin/upload` (already exists)
- Returns URL to parent via callback
- Loading state with spinner
- "Supprimer" button to clear

**Step 2: Commit**

```bash
git add components/admin/ContentImageUpload.tsx
git commit -m "feat: add content image upload component"
```

---

## Task 12: History Drawer Component

**Files:**
- Create: `components/admin/HistoryDrawer.tsx`

**Step 1: Build the history drawer**

- Drawer (slide from right) using shadcn Sheet
- Title "Historique des modifications"
- Timeline of entries: date, changed_by, diff preview
- For text: show old value truncated
- For images: show thumbnail before
- "Restaurer" button per entry
- Calls POST `/api/admin/history` to restore

**Step 2: Commit**

```bash
git add components/admin/HistoryDrawer.tsx
git commit -m "feat: add history drawer component"
```

---

## Task 13: Admin Page — `/admin/emails`

**Files:**
- Create: `app/admin/emails/page.tsx`

**Step 1: Build the email management page**

Design:
- Page title "Emails transactionnels"
- Card per template (order_confirmation, welcome_newsletter)
- Each card shows: label, subject, last updated
- Click → edit view with:
  - Left panel: form fields (from_name, from_email, subject, greeting, body_text, cta_text, cta_url, signoff, extra_params as key-value pairs)
  - Right panel: live preview iframe showing the rendered HTML (fetched from `/api/admin/emails/preview` on each change with debounce 500ms)
  - Variables shown as blue pills: {firstName}, {orderNumber}, etc.
  - "Envoyer un test" button → modal asking for email address → calls `/api/admin/emails/test`
  - "Enregistrer" button
  - History icon → HistoryDrawer

**Step 2: Add sidebar link**

Modify: `components/admin/AdminSidebar.tsx` — add "Emails" link with Mail icon pointing to `/admin/emails`.

**Step 3: Commit**

```bash
git add app/admin/emails/ components/admin/AdminSidebar.tsx
git commit -m "feat: add admin email management page with live preview"
```

---

## Task 14: Update Email Templates to Use DB Settings

**Files:**
- Modify: `lib/email/order-confirmation.ts`
- Modify: `lib/email/templates/order-confirmation-v3.ts`
- Modify: `lib/email/templates/welcome-newsletter-v3.ts` (if sending function exists)

**Step 1: Update `sendOrderConfirmation` to fetch settings from DB**

In `lib/email/order-confirmation.ts`:
1. Import `getEmailSettings` from `lib/cms/emails`
2. Fetch settings for `order_confirmation`
3. Pass `from`, `subject`, `greeting`, `body_text`, `cta_text`, `signoff` to the render function
4. Use settings for `resend.emails.send()` from/subject
5. Fallback to current hardcoded values if settings not found (graceful degradation)

**Step 2: Update render functions to accept settings params**

Modify `renderOrderConfirmationV3` to accept optional overrides for greeting, body_text, cta_text, signoff. Same for `renderWelcomeNewsletterV3`.

**Step 3: Commit**

```bash
git add lib/email/
git commit -m "feat: email templates now use DB settings with hardcoded fallback"
```

---

## Task 15: Update Front-End Components to Use CMS

**Files:**
- Modify: `components/sections/home/HeroSection.tsx`
- Modify: `components/sections/home/CollectionsSection.tsx`
- Modify: `components/sections/home/BrandStorySection.tsx`
- Modify: `components/sections/home/NewsletterSection.tsx`
- Modify: `components/sections/home/TrustBarSection.tsx`
- Modify: `components/layout/Footer.tsx`
- Modify: `components/contact/ContactV1.tsx`
- Modify: `components/sections/histoire/v2/*.tsx` (all sections)

**Step 1: Create a server-side content wrapper**

Since HeroSection is `'use client'`, we need to fetch content server-side in the parent page and pass as props. Create a pattern:

In `app/page.tsx` (homepage):
```typescript
import { getSiteContent } from '@/lib/cms/content';

export default async function HomePage() {
  const hero = await getSiteContent('hero');
  const collections = await getSiteContent('collections');
  const brandStory = await getSiteContent('brand_story');
  const newsletter = await getSiteContent('newsletter');
  const trustBar = await getSiteContent('trust_bar');

  return (
    <>
      <HeroSection content={hero} />
      <TrustBarSection content={trustBar} />
      {/* ... */}
    </>
  );
}
```

**Step 2: Update each component to accept `content` prop**

For each component, add a `content?: Record<string, string>` prop. Use `content?.title || "hardcoded fallback"` pattern so the site still works without DB data.

**Step 3: Update similarly for Footer (in layout.tsx) and Contact page**

**Step 4: Commit**

```bash
git add app/page.tsx app/notre-histoire/ app/contact/ components/sections/ components/layout/Footer.tsx
git commit -m "feat: front-end components now use CMS content with fallbacks"
```

---

## Task 16: Final Testing & Polish

**Step 1: Test CMS flow end-to-end**

1. Go to `/admin/contenu`
2. Edit hero title → Save → Check homepage reflects change
3. Upload new hero image → Save → Check homepage
4. Check history → Restore old value → Verify

**Step 2: Test Email flow end-to-end**

1. Go to `/admin/emails`
2. Edit order confirmation greeting → Preview updates live
3. Click "Envoyer un test" → Receive email with new content
4. Check history → Restore

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: polish CMS and email management"
```

---

## Summary

| Task | Description | Estimated Steps |
|------|-------------|-----------------|
| 1 | Database migrations (3 tables) | 5 |
| 2 | Seed site_content | 3 |
| 3 | Seed email_settings | 2 |
| 4 | CMS content helper | 2 |
| 5 | Email settings helper | 2 |
| 6 | History helper | 2 |
| 7 | Content API routes | 2 |
| 8 | Email API routes (CRUD + preview + test) | 4 |
| 9 | History API route | 2 |
| 10 | Admin contenu page | 3 |
| 11 | Image upload component | 2 |
| 12 | History drawer component | 2 |
| 13 | Admin emails page | 3 |
| 14 | Update email templates to use DB | 3 |
| 15 | Update front-end components to use CMS | 4 |
| 16 | Final testing & polish | 3 |

**Total: 16 tasks, ~42 steps**
