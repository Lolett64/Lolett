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
      for (const method of ['select', 'insert', 'update', 'eq', 'neq', 'in', 'limit', 'single', 'maybeSingle']) {
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

});

/**
 * Base simulée pour PUT : catégorie femme « hauts », 2 produits femme dessus,
 * 1 produit unisexe. `fail` force une erreur sur une étape.
 */
function db(opts: { other?: boolean; taken?: boolean; fail?: 'before' | 'others' | 'move' | 'update' } = {}) {
  state.respond = (q) => {
    const isCat = q.table === 'categories';
    if (isCat && has(q, 'maybeSingle')) {
      return opts.fail === 'before'
        ? { data: null, error: { message: 'timeout' } }
        : { data: { gender: 'femme', slug: 'hauts' }, error: null };
    }
    if (isCat && has(q, 'neq') && !has(q, 'update')) {
      const slugEq = eqs(q).find(([k]) => k === 'slug')?.[1];
      if (slugEq === 'hauts') {
        return opts.fail === 'others'
          ? { data: null, error: { message: 'timeout' } }
          : { data: opts.other ? [{ id: 'cat-homme' }] : [], error: null };
      }
      return { data: opts.taken ? [{ id: 'cat-2' }] : [], error: null };
    }
    if (q.table === 'products' && has(q, 'select')) {
      const genders = (q.calls.find((c) => c.method === 'in' && c.args[0] === 'gender')?.args[1] ?? []) as string[];
      const rows = [
        { id: 'p1', gender: 'femme' },
        { id: 'p2', gender: 'femme' },
        { id: 'p3', gender: 'both' },
      ].filter((p) => genders.includes(p.gender));
      return { data: rows, error: null };
    }
    if (q.table === 'products' && has(q, 'update')) {
      const back = (arg(q, 'update') as { category_slug: string }).category_slug === 'hauts';
      return opts.fail === 'move' && !back ? { data: null, error: { message: 'boom' } } : { data: {}, error: null };
    }
    if (isCat && has(q, 'update')) {
      return opts.fail === 'update' ? { data: null, error: { message: 'boom' } } : { data: {}, error: null };
    }
    return { data: [], error: null };
  };
}
const productMoves = () =>
  state.queries
    .filter((q) => q.table === 'products' && has(q, 'update'))
    .map((q) => ({ to: (arg(q, 'update') as { category_slug: string }).category_slug, ids: q.calls.find((c) => c.method === 'in')?.args[1] }));
const categoryUpdated = () => state.queries.some((q) => q.table === 'categories' && has(q, 'update'));
const body = { gender: 'femme', slug: 'Tops', label: 'Tops' };

describe('PUT : renommer le slug déplace les produits avec', () => {
  it('nettoie le slug ; slug identique une fois nettoyé = aucun produit touché', async () => {
    db();
    const res = await PUT(req('PUT', { gender: 'femme', slug: 'Hauts ', label: 'Hauts' }), ctx);
    expect(res.status).toBe(200);
    const update = state.queries.find((q) => q.table === 'categories' && has(q, 'update'))!;
    expect((arg(update, 'update') as { slug: string }).slug).toBe('hauts');
    expect(state.queries.some((q) => q.table === 'products')).toBe(false);
  });

  it('les produits femme ET unisexes suivent si plus aucune catégorie ne garde l’ancien slug', async () => {
    db({ other: false });
    const res = await PUT(req('PUT', body), ctx);
    expect(res.status).toBe(200);
    expect(productMoves()).toEqual([{ to: 'tops', ids: ['p1', 'p2', 'p3'] }]);
  });

  it('les unisexes restent si la catégorie homme garde l’ancien slug', async () => {
    db({ other: true });
    await PUT(req('PUT', body), ctx);
    expect(productMoves()).toEqual([{ to: 'tops', ids: ['p1', 'p2'] }]);
  });

  it('slug déjà pris pour ce genre : 409, rien n’est touché', async () => {
    db({ taken: true });
    const res = await PUT(req('PUT', body), ctx);
    expect(res.status).toBe(409);
    expect(productMoves()).toEqual([]);
    expect(categoryUpdated()).toBe(false);
  });

  it('changer le genre d’une catégorie existante est refusé', async () => {
    db();
    const res = await PUT(req('PUT', { ...body, gender: 'homme' }), ctx);
    expect(res.status).toBe(400);
    expect(categoryUpdated()).toBe(false);
  });

  it('lecture de la catégorie en échec : 500, rien n’est touché', async () => {
    db({ fail: 'before' });
    const res = await PUT(req('PUT', body), ctx);
    expect(res.status).toBe(500);
    expect(categoryUpdated()).toBe(false);
  });

  it('vérification « autre catégorie » en échec : 500, aucun produit déplacé', async () => {
    db({ fail: 'others' });
    const res = await PUT(req('PUT', body), ctx);
    expect(res.status).toBe(500);
    expect(productMoves()).toEqual([]);
    expect(categoryUpdated()).toBe(false);
  });

  it('déplacement des produits en échec : 500, catégorie non renommée', async () => {
    db({ fail: 'move' });
    const res = await PUT(req('PUT', body), ctx);
    expect(res.status).toBe(500);
    expect(categoryUpdated()).toBe(false);
  });

  it('renommage de la catégorie en échec : les produits reviennent à l’ancien slug', async () => {
    db({ fail: 'update' });
    const res = await PUT(req('PUT', body), ctx);
    expect(res.status).toBe(500);
    expect(productMoves()).toEqual([
      { to: 'tops', ids: ['p1', 'p2', 'p3'] },
      { to: 'hauts', ids: ['p1', 'p2', 'p3'] },
    ]);
  });
});
