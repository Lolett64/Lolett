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
      'T-shirts, sweats et chemises homme LOLETT. Des hauts pensés pour les journées ensoleillées et les soirées en terrasse.',
  },
  {
    gender: 'homme',
    slug: 'bas',
    label: 'Bas',
    seo_title: 'Bas Homme — LOLETT',
    seo_description:
      'Jeans et pantalons homme LOLETT. Coupes décontractées et matières de qualité pour un style au quotidien.',
  },
  {
    gender: 'homme',
    slug: 'vestes',
    label: 'Vestes',
    seo_title: 'Vestes Homme — LOLETT',
    seo_description:
      'Vestes et blousons homme LOLETT. Des pièces légères et élégantes pour les soirées fraîches.',
  },
  {
    gender: 'homme',
    slug: 'accessoires',
    label: 'Accessoires',
    seo_title: 'Accessoires Homme — LOLETT',
    seo_description:
      'Sacoches et accessoires homme LOLETT. Les détails qui font la différence.',
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
      'Jeans, pantalons et shorts femme LOLETT. Des bas fluides et féminins pour chaque occasion.',
  },
  {
    gender: 'femme',
    slug: 'robes',
    label: 'Robes & Combinaisons',
    seo_title: 'Robes & Combinaisons Femme — LOLETT',
    seo_description:
      'Robes et combinaisons femme LOLETT. Des pièces féminines et légères pour toutes les occasions.',
  },
  {
    gender: 'femme',
    slug: 'bijoux',
    label: 'Bijoux',
    seo_title: 'Bijoux Femme — LOLETT',
    seo_description:
      'Bagues, boucles d\'oreilles, bracelets et colliers LOLETT. Des bijoux dorés et raffinés pour sublimer chaque tenue.',
  },
  {
    gender: 'femme',
    slug: 'chaussures',
    label: 'Chaussures',
    seo_title: 'Chaussures Femme — LOLETT',
    seo_description:
      'Mules, espadrilles et mocassins femme LOLETT. Des chaussures confortables et stylées pour l\'été.',
  },
  {
    gender: 'femme',
    slug: 'sacs',
    label: 'Sacs',
    seo_title: 'Sacs Femme — LOLETT',
    seo_description:
      'Mini sacs et sacs bandoulière femme LOLETT. Les compagnons indispensables de votre style.',
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
