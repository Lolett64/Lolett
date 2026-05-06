/**
 * Escape les caractères HTML spéciaux pour empêcher XSS lors d'interpolation
 * dans des templates email ou HTML.
 *
 * Ordre IMPORTANT : `&` doit être escapé en premier sinon les entités déjà
 * présentes seraient double-escapées.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
