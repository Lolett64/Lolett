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
    const updateArg = (update.mock.calls[0] as unknown as [Record<string, unknown>])[0];
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
