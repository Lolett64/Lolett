/**
 * Seed script — categories
 *
 * Usage (from the lolett-app directory):
 *   npx tsx --env-file=.env.local scripts/seed-categories.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Run: npx tsx --env-file=.env.local scripts/seed-categories.ts'
  );
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type CategorySeed = {
  gender: 'homme' | 'femme';
  slug: string;
  label: string;
  seo_title: string;
  seo_description: string;
};

const categories: CategorySeed[] = [
  // ── Homme ──────────────────────────────────────────────────────────────────
  {
    gender: 'homme',
    slug: 'hauts',
    label: 'Hauts',
    seo_title: 'Hauts Homme — LOLETT',
    seo_description:
      'Chemises, polos et t-shirts homme LOLETT. Des hauts pensés pour les journées ensoleillées et les soirées en terrasse.',
  },
  {
    gender: 'homme',
    slug: 'bas',
    label: 'Bas',
    seo_title: 'Bas Homme — LOLETT',
    seo_description:
      'Pantalons et shorts homme LOLETT. Coupes décontractées et matières respirantes pour un style du Sud-Ouest au quotidien.',
  },
  {
    gender: 'homme',
    slug: 'chaussures',
    label: 'Chaussures',
    seo_title: 'Chaussures Homme — LOLETT',
    seo_description:
      'Chaussures homme LOLETT. Sandales, espadrilles et sneakers pour compléter vos looks estivaux avec style.',
  },
  {
    gender: 'homme',
    slug: 'accessoires',
    label: 'Accessoires',
    seo_title: 'Accessoires Homme — LOLETT',
    seo_description:
      'Accessoires homme LOLETT. Ceintures, lunettes et sacs pour finaliser chaque look et sortir prêt.',
  },
  // ── Femme ──────────────────────────────────────────────────────────────────
  {
    gender: 'femme',
    slug: 'hauts',
    label: 'Hauts',
    seo_title: 'Hauts Femme — LOLETT',
    seo_description:
      'Tops, blouses et chemisiers femme LOLETT. Des hauts élégants et légers inspirés du soleil du Sud.',
  },
  {
    gender: 'femme',
    slug: 'bas',
    label: 'Bas',
    seo_title: 'Bas Femme — LOLETT',
    seo_description:
      'Jupes, robes courtes et pantalons femme LOLETT. Des bas fluides et féminins pour chaque occasion estivale.',
  },
  {
    gender: 'femme',
    slug: 'chaussures',
    label: 'Chaussures',
    seo_title: 'Chaussures Femme — LOLETT',
    seo_description:
      'Chaussures femme LOLETT. Mules, sandales et espadrilles pour sublimer vos tenues avec une touche du Sud-Ouest.',
  },
  {
    gender: 'femme',
    slug: 'accessoires',
    label: 'Accessoires',
    seo_title: 'Accessoires Femme — LOLETT',
    seo_description:
      'Accessoires femme LOLETT. Sacs, foulards et bijoux pour parfaire chaque look et sortir prête.',
  },
];

async function seed() {
  console.log(`Seeding ${categories.length} categories…`);

  const { data, error } = await admin
    .from('categories')
    .upsert(categories, { onConflict: 'gender,slug', ignoreDuplicates: false })
    .select('id, gender, slug');

  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }

  console.log(`Done — ${data?.length ?? 0} rows upserted:`);
  (data ?? []).forEach((row) => {
    const { id, gender, slug } = row as { id: string; gender: string; slug: string };
    console.log(`  [${gender}] ${slug} → ${id}`);
  });
}

seed();
