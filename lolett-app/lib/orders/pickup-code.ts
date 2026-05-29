import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Alphabet de 32 caractères SANS 0/O/1/I (ambiguïtés visuelles).
 * 32^5 ≈ 33,5M combinaisons → collision <0,1% jusqu'à 100k commandes en attente.
 */
export const PICKUP_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const PICKUP_CODE_LENGTH = 5;
const MAX_ATTEMPTS = 8;

/**
 * Génère un code de retrait au format `LOL-XXXXX` (5 caractères de l'alphabet).
 * Utilise crypto.getRandomValues ; l'unicité réelle est garantie par la
 * contrainte UNIQUE en DB + le retry de assignPickupCodeAtomic.
 */
export function generatePickupCode(): string {
  const bytes = new Uint8Array(PICKUP_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return (
    'LOL-' +
    Array.from(bytes)
      .map((b) => PICKUP_CODE_ALPHABET[b % PICKUP_CODE_ALPHABET.length])
      .join('')
  );
}

/**
 * Assigne atomiquement un code de retrait unique à une commande.
 *
 * Une seule requête UPDATE écrit `pickup_code` + `extraPayload` (typiquement
 * `status: 'ready_for_pickup'` et `ready_for_pickup_at`). La clause
 * `.is('pickup_code', null)` rend l'opération idempotente : si un code est déjà
 * posé, aucune ligne ne matche.
 *
 * On utilise `.maybeSingle()` (PAS `.single()`) : sur 0 ligne matchée (cas
 * idempotent), `.maybeSingle()` renvoie `{ data: null, error: null }` → on
 * renvoie null en NO-OP SILENCIEUX (aucun log). `.single()` aurait renvoyé
 * `error.code === 'PGRST116'`, qui serait loggé à tort comme erreur inattendue.
 *
 * Retry UNIQUEMENT sur collision UNIQUE (error.code === '23505'), jusqu'à
 * MAX_ATTEMPTS. Toute autre erreur est loggée et renvoie null immédiatement.
 */
export async function assignPickupCodeAtomic(
  supabase: SupabaseClient,
  orderId: string,
  extraPayload: Record<string, unknown> = {}
): Promise<{ code: string; updated: unknown } | null> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const code = generatePickupCode();
    const { data, error } = await supabase
      .from('orders')
      .update({ pickup_code: code, ...extraPayload })
      .eq('id', orderId)
      .is('pickup_code', null) // safety : ne ré-écrit jamais un code déjà posé
      .select()
      .maybeSingle();

    if (!error && data) return { code, updated: data };
    if (error?.code === '23505') continue; // collision UNIQUE → on retente
    if (error) {
      console.error('[pickup-code] unexpected error', error);
    }
    // error null + data null = idempotence (0 ligne matchée) → no-op silencieux
    return null;
  }
  return null;
}
