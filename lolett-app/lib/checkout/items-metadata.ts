/**
 * Stripe limite chaque valeur de metadata à 500 caractères. La liste des
 * articles (JSON) dépasse vite cette limite sur un gros panier : on la découpe
 * en morceaux `items`, `items_1`, `items_2`… et on la recolle à la lecture.
 *
 * La première clé reste `items` pour relire les sessions créées avant ce
 * découpage (une seule clé).
 */
const STRIPE_METADATA_VALUE_MAX = 500;

function chunkKey(index: number): string {
  return index === 0 ? 'items' : `items_${index}`;
}

export function encodeItemsMetadata(items: unknown): Record<string, string> {
  // Array.from découpe par caractère Unicode (jamais au milieu d'un emoji).
  const chars = Array.from(JSON.stringify(items));
  const metadata: Record<string, string> = {};
  for (let i = 0; i * STRIPE_METADATA_VALUE_MAX < chars.length; i++) {
    const start = i * STRIPE_METADATA_VALUE_MAX;
    metadata[chunkKey(i)] = chars.slice(start, start + STRIPE_METADATA_VALUE_MAX).join('');
  }
  return metadata;
}

export function decodeItemsMetadata(
  metadata: Record<string, string | undefined> | null | undefined
): string | null {
  if (!metadata?.items) return null;
  let json = '';
  for (let i = 0; metadata[chunkKey(i)]; i++) json += metadata[chunkKey(i)];
  return json;
}
