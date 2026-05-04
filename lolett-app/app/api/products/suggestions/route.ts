import { NextRequest, NextResponse } from 'next/server';
import { productRepository } from '@/lib/adapters/supabase-product';
import type { Gender, Product } from '@/types';

export const dynamic = 'force-dynamic';

const MAX_LIMIT = 8;
const DEFAULT_LIMIT = 4;
const POOL_SIZE = 48;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Genre dominant : majorité parmi les produits du panier (tie-break = 'both').
function dominantGender(cartProducts: Product[]): Gender | null {
  if (cartProducts.length === 0) return null;
  const counts: Record<string, number> = { homme: 0, femme: 0, both: 0 };
  for (const p of cartProducts) counts[p.gender] = (counts[p.gender] ?? 0) + 1;
  if (counts.homme > counts.femme) return 'homme';
  if (counts.femme > counts.homme) return 'femme';
  return 'both';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeRaw = searchParams.get('exclude') ?? '';
    const limitRaw = Number(searchParams.get('limit') ?? DEFAULT_LIMIT);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(1, Math.floor(limitRaw)), MAX_LIMIT) : DEFAULT_LIMIT;

    const excludeIds = excludeRaw
      .split(',')
      .map((id) => id.trim())
      .filter((id) => /^[0-9a-fA-F-]{36}$/.test(id));
    const excludeSet = new Set(excludeIds);

    // 1. Récupère les produits du panier pour connaître leur genre + catégories
    const cartProducts = excludeIds.length > 0
      ? await productRepository.findByIds(excludeIds)
      : [];

    const gender = dominantGender(cartProducts);
    const cartCategories = new Set(cartProducts.map((p) => p.categorySlug).filter(Boolean));

    // 2. Pool : produits du même genre (findMany inclut 'both' automatiquement)
    let pool = await productRepository.findMany({
      gender: gender ?? undefined,
      limit: POOL_SIZE,
    });

    // Fallback : si pool insuffisant pour ce genre, élargir à tout
    if (pool.length < limit + excludeSet.size) {
      pool = await productRepository.findMany({ limit: POOL_SIZE });
    }

    const eligible = pool.filter((p) => !excludeSet.has(p.id) && p.stock > 0);

    // 3. Priorise même catégorie si possible, sinon shuffle global
    const sameCat = shuffle(eligible.filter((p) => cartCategories.has(p.categorySlug)));
    const otherCat = shuffle(eligible.filter((p) => !cartCategories.has(p.categorySlug)));
    const ranked = [...sameCat, ...otherCat];

    const suggestions = ranked.slice(0, limit).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      image: p.images[0] ?? '',
    }));

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error('[GET /api/products/suggestions]', err);
    return NextResponse.json({ suggestions: [] });
  }
}
