// Mentions légales utilisées sur les factures et documents officiels.
// Source : CGV publiées sur lolettshop.com/cgv.

export const LEGAL = {
  brandName: 'LOLETT',
  legalName: 'LOLETT',
  siret: '99960933200013',
  rcs: 'RCS Pau',
  address: '30 avenue Honoré Baradat',
  postalCode: '64000',
  city: 'Pau',
  country: 'France',
  vatRegime: 'exonere' as 'exonere' | 'assujetti',
  vatMention: 'TVA non applicable, art. 293 B du CGI',
  email: 'bonjour@lolettshop.com',
  website: 'lolettshop.com',
} as const;

export function formatLegalAddress(): string {
  return `${LEGAL.address}, ${LEGAL.postalCode} ${LEGAL.city}, ${LEGAL.country}`;
}
