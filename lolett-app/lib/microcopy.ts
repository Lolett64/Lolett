const MICROCOPY_POOLS: Record<'general' | 'accessories' | 'confirmation', string[]> = {
  general: [
    'On valide les yeux fermés. Enfin presque.',
    'Tu vas faire des jaloux. C\'est le but.',
    'Si tu hésites, c\'est déjà trop tard.',
    'Le miroir va kiffer.',
    'Ton prochain compliment commence ici.',
  ],
  accessories: [
    'Le détail qui fait toute la différence.',
    'Petit mais costaud en style.',
    'L\'accessoire que ton outfit attendait.',
  ],
  confirmation: [
    'Excellente décision. Vraiment.',
    'Tu vas recevoir des compliments. Beaucoup.',
    'LOLETT te remercie.',
  ],
};

export function getRandomMicrocopy(pool: 'general' | 'accessories' | 'confirmation'): string {
  const phrases = MICROCOPY_POOLS[pool];
  const index = Math.floor(Math.random() * phrases.length);
  return phrases[index];
}

export const MICROCOPY: Record<string, string> = {
  productValidated: 'Validé par LOLETT. Tu peux y aller tranquille.',
  cartTagline: 'T\'es à deux clics d\'être le plus stylé de ta terrasse.',
  cartEmpty: 'Ton panier est vide... mais pas pour longtemps.',
  favoritesEmpty: 'Reviens, on a gardé tes coups de coeur.',
  heroWelcome: 'Entre. Tu verras, ça vaut le coup d\'oeil et parfois plus.',
  disclaimer: 'LOLETT décline toute responsabilité en cas de coup de coeur.',
};
