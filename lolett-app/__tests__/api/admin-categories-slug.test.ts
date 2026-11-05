import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Faux client Supabase : chaque appel `from(table)` enregistre la chaîne
 * (select / update / eq / insert…) et se résout avec `respond(table, appels)`.
 */
type Call = { method: string; args: unknown[] };
type Query = { table: string; calls: Call[] };
type Respond = (q: Query) => { data: unknown; error: unknown };

const { state } = vi.hoisted(() => ({
  state: {
    queries: [] as Query[],
    respond: (() => ({ data: null, error: null })) as Respond,
  },
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from(table: string) {
      const query: Query = { table, calls: [] };
      state.queries.push(query);
      const builder: Record<string, unknown> = {};
      for (const method of ['select', 'insert', 'update', 'eq', 'limit', 'single', 'maybeSingle']) {
        builder[method] = (...args: unknown[]) => {
          query.calls.push({ method, args });
          return builder;
        };
      }
      builder.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
        Promise.resolve(state.respond(query)).then(resolve, reject);
      return builder;
    },
  }),
}));

import { POST } from '@/app/api/admin/categories/route';
import { PUT } from '@/app/api/admin/categories/[id]/route';

const has = (q: Query, method: string) => q.calls.some((c) => c.method === method);
const arg = (q: Query, method: string) => q.calls.find((c) => c.method === method)?.args[0];
const eqs = (q: Query) => q.calls.filter((c) => c.method === 'eq').map((c) => c.args);

function req(method: string, body: unknown): Request {
  return new Request('http://x/api/admin/categories', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
const ctx = { params: Promise.resolve({ id: 'cat-1' }) };

beforeEach(() => {
  state.queries = [];
  state.respond = () => ({ data: [{}], error: null });
});

describe('slug de catégorie toujours propre (adresse de la page)', () => {
  it('POST : un slug tapé comme un nom devient une adresse valide', async () => {
    const res = await POST(
      req('POST', { genders: ['femme'], slug: 'Pulls, gilets & sweat-shirt ', label: 'Pulls' }),
    );
    expect(res.status).toBe(201);
    const rows = arg(state.queries[0], 'insert') as { slug: string }[];
    expect(rows[0].slug).toBe('pulls-gilets-sweat-shirt');
  });

  it('POST : slug vide = slug tiré du nom', async () => {
    await POST(req('POST', { genders: ['homme'], slug: '', label: 'Vestes & Blazers' }));
    const rows = arg(state.queries[0], 'insert') as { slug: string }[];
    expect(rows[0].slug).toBe('vestes-blazers');
  });

  it('PUT : nettoie le slug avant de l’enregistrer', async () => {
    state.respond = (q) =>
      has(q, 'single') && !has(q, 'update')
        ? { data: { gender: 'femme', slug: 'chemises-blouses' }, error: null }
        : { data: {}, error: null };
    const res = await PUT(
      req('PUT', { gender: 'femme', slug: 'Chemises & Blouses', label: 'Chemises & blouses' }),
      ctx,
    );
    expect(res.status).toBe(200);
    const update = state.queries.find((q) => q.table === 'categories' && has(q, 'update'))!;
    expect((arg(update, 'update') as { slug: string }).slug).toBe('chemises-blouses');
    // slug inchangé une fois nettoyé : aucun produit à déplacer
    expect(state.queries.some((q) => q.table === 'products')).toBe(false);
  });
});

describe('renommer le slug déplace les produits avec', () => {
  function setup(otherCategoryKeepsOldSlug: boolean) {
    state.respond = (q) => {
      if (q.table === 'categories' && has(q, 'single') && !has(q, 'update')) {
        return { data: { gender: 'femme', slug: 'hauts' }, error: null };
      }
      if (q.table === 'categories' && has(q, 'limit')) {
        return { data: otherCategoryKeepsOldSlug ? [{ id: 'cat-homme' }] : [], error: null };
      }
      return { data: {}, error: null };
    };
  }
  const body = { gender: 'femme', slug: 'tops', label: 'Tops' };

  it('les produits Femme de l’ancien slug passent au nouveau', async () => {
    setup(true);
    await PUT(req('PUT', body), ctx);
    const moves = state.queries.filter((q) => q.table === 'products' && has(q, 'update'));
    expect(moves).toHaveLength(1);
    expect(arg(moves[0], 'update')).toEqual({ category_slug: 'tops' });
    expect(eqs(moves[0])).toEqual([['category_slug', 'hauts'], ['gender', 'femme']]);
  });

  it('les produits unisexes suivent aussi si plus aucune catégorie ne garde l’ancien slug', async () => {
    setup(false);
    await PUT(req('PUT', body), ctx);
    const moves = state.queries.filter((q) => q.table === 'products' && has(q, 'update'));
    expect(moves.map((m) => eqs(m)[1])).toEqual([['gender', 'femme'], ['gender', 'both']]);
  });

  it('slug déjà pris pour ce genre : message clair (409), aucun produit déplacé', async () => {
    state.respond = (q) => {
      if (q.table === 'categories' && has(q, 'update')) {
        return { data: null, error: { code: '23505', message: 'duplicate key' } };
      }
      return { data: { gender: 'femme', slug: 'hauts' }, error: null };
    };
    const res = await PUT(req('PUT', body), ctx);
    expect(res.status).toBe(409);
    expect(state.queries.some((q) => q.table === 'products')).toBe(false);
  });
});
