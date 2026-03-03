# Dynamic Sections Management — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow admins to toggle visibility and reorder sections on Home, Notre Histoire, and Contact pages from the admin panel.

**Architecture:** New `page_sections` Supabase table stores per-page section visibility and order. A CMS helper fetches visible sections server-side. Each page dynamically renders sections based on this data. Admin UI adds a "Sections" tab with switches and arrows.

**Tech Stack:** Next.js 15 App Router, Supabase (service role), React 19, Tailwind 4, shadcn/ui Switch component

---

### Task 1: Create Supabase migration for `page_sections` table

**Files:**
- Create: `lolett-app/supabase/migrations/20260303000001_create_page_sections.sql`

**Step 1: Write the migration SQL**

```sql
-- Table for managing section visibility and order per page
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  label TEXT NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page_slug, section_key)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_page_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER page_sections_updated_at
  BEFORE UPDATE ON page_sections
  FOR EACH ROW EXECUTE FUNCTION update_page_sections_updated_at();

-- Seed: Home page
INSERT INTO page_sections (page_slug, section_key, label, sort_order) VALUES
  ('home', 'hero', 'Hero / Vidéo', 0),
  ('home', 'collections', 'Collections', 1),
  ('home', 'new_arrivals', 'Nouveautés', 2),
  ('home', 'brand_story', 'Histoire de marque', 3),
  ('home', 'looks', 'Looks du moment', 4),
  ('home', 'testimonials', 'Témoignages', 5),
  ('home', 'newsletter', 'Newsletter', 6);

-- Seed: Notre Histoire page
INSERT INTO page_sections (page_slug, section_key, label, sort_order) VALUES
  ('notre-histoire', 'hero', 'Hero', 0),
  ('notre-histoire', 'lola', 'Texte Lola', 1),
  ('notre-histoire', 'origine', 'L''origine', 2),
  ('notre-histoire', 'materials', 'Matières', 3),
  ('notre-histoire', 'vision', 'Notre vision', 4),
  ('notre-histoire', 'carousel', 'Carousel inspirations', 5),
  ('notre-histoire', 'cta', 'Call to action', 6);

-- Seed: Contact page
INSERT INTO page_sections (page_slug, section_key, label, sort_order) VALUES
  ('contact', 'hero', 'Hero', 0),
  ('contact', 'faq', 'FAQ', 1),
  ('contact', 'form', 'Formulaire', 2),
  ('contact', 'newsletter', 'Newsletter', 3);

-- RLS: public read, admin write
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page_sections"
  ON page_sections FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage page_sections"
  ON page_sections FOR ALL
  USING (true)
  WITH CHECK (true);
```

**Step 2: Apply migration**

Run: `cd lolett-app && npx supabase db push`
Expected: Migration applied successfully.

**Step 3: Commit**

```bash
git add supabase/migrations/20260303000001_create_page_sections.sql
git commit -m "feat: add page_sections table for dynamic section management"
```

---

### Task 2: Create CMS helper `lib/cms/sections.ts`

**Files:**
- Create: `lolett-app/lib/cms/sections.ts`

**Step 1: Write the helper**

```typescript
import { createAdminClient } from '@/lib/supabase/admin';

export interface PageSection {
  id: string;
  page_slug: string;
  section_key: string;
  label: string;
  visible: boolean;
  sort_order: number;
  updated_at: string;
}

/** Fetch visible sections for a page, sorted by sort_order */
export async function getPageSections(pageSlug: string): Promise<PageSection[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('page_sections')
    .select('*')
    .eq('page_slug', pageSlug)
    .order('sort_order');

  if (error || !data) return [];
  return data as PageSection[];
}

/** Get only visible section keys for a page (for frontend rendering) */
export async function getVisibleSectionKeys(pageSlug: string): Promise<string[]> {
  const sections = await getPageSections(pageSlug);
  return sections.filter(s => s.visible).map(s => s.section_key);
}
```

**Step 2: Commit**

```bash
git add lib/cms/sections.ts
git commit -m "feat: add getPageSections helper for dynamic sections"
```

---

### Task 3: Create API routes for admin sections management

**Files:**
- Create: `lolett-app/app/api/admin/sections/route.ts`

**Step 1: Write the API route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/admin/sections?page=home
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const page = request.nextUrl.searchParams.get('page');
  if (!page) {
    return NextResponse.json({ error: 'page parameter required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('page_sections')
    .select('*')
    .eq('page_slug', page)
    .order('sort_order');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT /api/admin/sections — bulk update visible + sort_order
export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { items } = await request.json() as {
    items: { id: string; visible: boolean; sort_order: number }[];
  };

  if (!items?.length) {
    return NextResponse.json({ error: 'items required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Update each item
  for (const item of items) {
    const { error } = await supabase
      .from('page_sections')
      .update({ visible: item.visible, sort_order: item.sort_order })
      .eq('id', item.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
```

**Step 2: Commit**

```bash
git add app/api/admin/sections/route.ts
git commit -m "feat: add admin API routes for sections management"
```

---

### Task 4: Create admin Sections tab component

**Files:**
- Create: `lolett-app/components/admin/contenu/SectionsManager.tsx`

**Step 1: Write the component**

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown, Save, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface SectionItem {
  id: string;
  page_slug: string;
  section_key: string;
  label: string;
  visible: boolean;
  sort_order: number;
}

const PAGES = [
  { slug: 'home', label: 'Accueil' },
  { slug: 'notre-histoire', label: 'Notre Histoire' },
  { slug: 'contact', label: 'Contact' },
];

export function SectionsManager() {
  const [activePage, setActivePage] = useState('home');
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchSections = useCallback(async (page: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sections?page=${page}`);
      const data = await res.json();
      setSections(data);
      setDirty(false);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections(activePage);
  }, [activePage, fetchSections]);

  const handlePageChange = (slug: string) => {
    setActivePage(slug);
    setSaved(false);
  };

  const toggleVisible = (id: string) => {
    setSections(prev =>
      prev.map(s => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
    setDirty(true);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setSections(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((s, i) => ({ ...s, sort_order: i }));
    });
    setDirty(true);
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    setSections(prev => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((s, i) => ({ ...s, sort_order: i }));
    });
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: sections.map(s => ({
            id: s.id,
            visible: s.visible,
            sort_order: s.sort_order,
          })),
        }),
      });
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page tabs */}
      <div className="flex gap-2">
        {PAGES.map(page => (
          <button
            key={page.slug}
            onClick={() => handlePageChange(page.slug)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activePage === page.slug
                ? 'bg-[#1B0B94] text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      {/* Sections list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-white border border-gray-200" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`flex items-center justify-between rounded-xl border bg-white p-4 transition-opacity ${
                section.visible ? 'border-gray-200' : 'border-gray-100 opacity-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="rounded p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === sections.length - 1}
                    className="rounded p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{section.label}</p>
                  <p className="text-xs text-gray-400">{section.section_key}</p>
                </div>
              </div>
              <Switch
                checked={section.visible}
                onCheckedChange={() => toggleVisible(section.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1B0B94] px-4 py-2 text-sm font-medium text-white hover:bg-[#130970] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Enregistrer
        </button>
        {saved && (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 animate-pulse">
            Sauvegardé
          </span>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/admin/contenu/SectionsManager.tsx
git commit -m "feat: add SectionsManager admin component"
```

---

### Task 5: Add tabs to the admin contenu page

**Files:**
- Modify: `lolett-app/app/admin/contenu/page.tsx`

**Step 1: Add tab UI with "Contenu" and "Sections" tabs**

Import `SectionsManager` and wrap the existing content in a tabbed layout. Add a `tab` state (`'contenu' | 'sections'`). When `tab === 'sections'`, render `<SectionsManager />` instead of the accordion.

Key changes to `app/admin/contenu/page.tsx`:
- Add `useState` for `activeTab` (default `'contenu'`)
- Add tab buttons after the header `<h1>`
- Wrap existing accordion in `{activeTab === 'contenu' && (...)}`
- Add `{activeTab === 'sections' && <SectionsManager />}`

**Step 2: Commit**

```bash
git add app/admin/contenu/page.tsx
git commit -m "feat: add Sections tab to admin contenu page"
```

---

### Task 6: Integrate dynamic sections into Home page

**Files:**
- Modify: `lolett-app/app/page.tsx`

**Step 1: Fetch page sections and render dynamically**

Replace the hardcoded section list with a dynamic renderer:

```tsx
import { getPageSections } from '@/lib/cms/sections';

// Inside HomePage:
const pageSections = await getPageSections('home');
const visibleKeys = pageSections.filter(s => s.visible).map(s => s.section_key);

// Build a section registry
const SECTION_MAP: Record<string, React.ReactNode> = {
  hero: <HeroSection content={...} hexColor={hexColor} />,
  collections: null, // CollectionsSection not currently rendered — skip
  new_arrivals: <NewArrivalsSection products={newProducts} hexColor={hexColor} />,
  brand_story: <BrandStorySection content={brandStoryContent} hexColor={hexColor} />,
  looks: <LooksSection looks={featuredLooks} lookProducts={lookProducts} hexColor={hexColor} />,
  newsletter: <NewsletterSection content={...} hexColor={hexColor} />,
};

// Render in order
return (
  <main>
    {visibleKeys.map(key => SECTION_MAP[key] ? (
      <Fragment key={key}>{SECTION_MAP[key]}</Fragment>
    ) : null)}
  </main>
);
```

Fallback: if `pageSections` is empty (table not seeded yet), render all sections in default order.

**Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: home page renders sections dynamically from page_sections"
```

---

### Task 7: Integrate dynamic sections into Notre Histoire page

**Files:**
- Modify: `lolett-app/app/notre-histoire/content.tsx`

**Step 1: Accept sections prop and render conditionally**

Add a `visibleSections` prop (string array). Map section_key to each block of JSX in the component. Only render blocks whose key is in the array. Keep the same order as the array.

The parent `app/notre-histoire/page.tsx` fetches `getVisibleSectionKeys('notre-histoire')` server-side and passes it down.

**Step 2: Commit**

```bash
git add app/notre-histoire/content.tsx app/notre-histoire/page.tsx
git commit -m "feat: notre-histoire page renders sections dynamically"
```

---

### Task 8: Integrate dynamic sections into Contact page

**Files:**
- Modify: `lolett-app/components/contact/ContactV2.tsx` (or the contact page component)

**Step 1: Same pattern as Notre Histoire**

Fetch `getVisibleSectionKeys('contact')` server-side, pass as prop, render conditionally.

**Step 2: Commit**

```bash
git add components/contact/ContactV2.tsx
git commit -m "feat: contact page renders sections dynamically"
```

---

### Task 9: Verify and test end-to-end

**Step 1: Start dev server**

Run: `cd lolett-app && npm run dev`

**Step 2: Test admin UI**

1. Go to `/admin/contenu` → click "Sections" tab
2. Select "Accueil" → verify 7 sections listed
3. Toggle one section OFF → click "Enregistrer"
4. Move a section with arrows → click "Enregistrer"
5. Verify changes persist after page refresh

**Step 3: Test frontend**

1. Go to `/` → verify the toggled-off section is hidden
2. Verify section order matches what was set in admin
3. Check "Notre Histoire" and "Contact" pages similarly

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: dynamic sections management — admin toggle + reorder"
```
