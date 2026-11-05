export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

/** Minuscules, sans accents (œ → oe), tout ce qui n'est ni lettre ni chiffre devient un tiret. */
function toSlugChars(text: string): string {
  return text
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-');
}

export function slugify(text: string): string {
  return toSlugChars(text).replace(/^-+|-+$/g, '');
}

/**
 * Pendant la frappe : comme `slugify`, mais garde le tiret final pour pouvoir
 * continuer à taper (« pulls-| »). Le serveur retire le reste à l'enregistrement.
 */
export function slugifyWhileTyping(text: string): string {
  return toSlugChars(text).replace(/^-+/, '');
}
