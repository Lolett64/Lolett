import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Génère un code carte cadeau au format `GIFT-XXXX-XXXX-XXXX`
 * (12 caractères hexadécimaux majuscules répartis en 3 groupes de 4).
 *
 * Utilise `crypto.getRandomValues` — la contrainte UNIQUE de la DB + un retry
 * côté caller gèrent la collision (~1 / 16^12 ≈ négligeable).
 */
export function generateGiftCardCode(): string {
  const bytes = new Uint8Array(6); // 6 bytes = 12 hex chars
  crypto.getRandomValues(bytes);

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

  return `GIFT-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

/**
 * Tente de générer un code carte cadeau unique en retentant jusqu'à 8 fois
 * si le code existe déjà dans la table `gift_cards`.
 */
export async function generateUniqueGiftCardCode(
  admin: SupabaseClient
): Promise<string> {
  const MAX_ATTEMPTS = 8;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateGiftCardCode();
    const { data, error } = await admin
      .from('gift_cards')
      .select('id')
      .eq('code', code)
      .maybeSingle();

    if (error) {
      // Si l'erreur n'est pas "not found", on log mais on tente le code quand même
      // (mieux vaut avoir une petite chance de collision qu'une erreur totale).
      console.warn('[gift-cards] Unique check error:', error.message);
      return code;
    }

    if (!data) {
      return code;
    }
  }

  throw new Error(
    `Impossible de générer un code carte cadeau unique après ${MAX_ATTEMPTS} tentatives`
  );
}
