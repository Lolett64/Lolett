# Dynamic Sections Management — Design Document

**Date**: 2026-03-03
**Status**: Approved

## Goal

Allow admin users to toggle visibility (ON/OFF) and reorder sections on all multi-section pages (Home, Notre Histoire, Contact) from the admin panel.

## Approach

New `page_sections` table (Approach A) — separates layout concerns from content.

## Database

### Table: `page_sections`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Auto-generated |
| page_slug | TEXT NOT NULL | "home", "notre-histoire", "contact" |
| section_key | TEXT NOT NULL | Component identifier (e.g., "hero") |
| label | TEXT NOT NULL | Display name in admin |
| visible | BOOLEAN DEFAULT true | Toggle ON/OFF |
| sort_order | INT NOT NULL | Display order |
| updated_at | TIMESTAMPTZ | Auto-updated |
| UNIQUE | | (page_slug, section_key) |

### Seed Data

**home**: hero(0), collections(1), new_arrivals(2), brand_story(3), looks(4), testimonials(5), newsletter(6)
**notre-histoire**: hero(0), origine(1), vision(2), med(3), lola(4)
**contact**: hero(0), faq(1), form(2), newsletter(3)

## Admin UI

Add "Sections" tab in `/admin/contenu`:

- Page selector: [Accueil] [Notre Histoire] [Contact]
- Section list with: label, switch ON/OFF, arrows ↑↓
- Save button for bulk update

## API Routes

- `GET /api/admin/sections?page=home` — list sections for a page
- `PUT /api/admin/sections` — bulk update visible + sort_order

## Frontend Integration

- `lib/cms/sections.ts`: `getPageSections(pageSlug)` → visible sections sorted by sort_order
- Each page uses this server-side to determine which sections to render and in what order
- Section registry maps section_key → React component

## What Stays the Same

- `site_content` table and content editing unchanged
- Section components keep current props
- Content history continues working
