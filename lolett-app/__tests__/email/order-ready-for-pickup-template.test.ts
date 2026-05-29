import { describe, it, expect } from 'vitest';
import {
  renderOrderReadyForPickupV3,
  type ReadyForPickupEmailData,
} from '@/lib/email/templates/order-ready-for-pickup-v3';

const BASE: ReadyForPickupEmailData = {
  firstName: 'Marie',
  orderNumber: 'LOL-20260530-TEST',
  pickupCode: 'LOL-A7K2X',
  pickupPoint: {
    provider: 'click_collect',
    id: 'pp-1',
    name: 'Boutique du Marais',
    address: '12 rue de Bretagne',
    postalCode: '75003',
    city: 'Paris',
    country: 'FR',
    hours: 'Lun-Sam 10h-19h',
    instructions: "Sonner à l'interphone LOLETT",
  },
};

describe('renderOrderReadyForPickupV3', () => {
  it('affiche le code de retrait en évidence', () => {
    const html = renderOrderReadyForPickupV3(BASE);
    expect(html).toContain('LOL-A7K2X');
    expect(html).toContain('letter-spacing: 0.08em');
    expect(html).toContain('monospace');
  });

  it('affiche le greeting interpolé par défaut avec le prénom', () => {
    const html = renderOrderReadyForPickupV3(BASE);
    expect(html).toContain('Marie');
    expect(html).toContain('Pr&ecirc;te au retrait');
  });

  it('affiche le nom, adresse, horaires et instructions du point', () => {
    const html = renderOrderReadyForPickupV3(BASE);
    expect(html).toContain('Boutique du Marais');
    expect(html).toContain('12 rue de Bretagne');
    expect(html).toContain('75003 Paris');
    expect(html).toContain('Lun-Sam 10h-19h');
    expect(html).toContain("interphone LOLETT");
  });

  it('échappe le HTML des champs dynamiques (anti-injection)', () => {
    const html = renderOrderReadyForPickupV3({
      ...BASE,
      pickupPoint: {
        ...BASE.pickupPoint,
        name: '<script>alert(1)</script>',
        instructions: '"><img src=x onerror=alert(1)>',
      },
    });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<img src=x');
  });

  it("masque le bloc horaires/instructions s'ils sont absents", () => {
    const html = renderOrderReadyForPickupV3({
      ...BASE,
      pickupPoint: {
        provider: 'click_collect',
        id: 'pp-2',
        name: 'Point sans détails',
        address: '1 rue X',
        postalCode: '75001',
        city: 'Paris',
        country: 'FR',
        hours: null,
        instructions: null,
      },
    });
    expect(html).toContain('Point sans détails');
    expect(html).not.toContain('Horaires');
    expect(html).not.toContain('Instructions');
  });

  it('applique le signoff override (avec remplacement du cœur)', () => {
    const html = renderOrderReadyForPickupV3(BASE, { signoff: 'À bientôt, LOLETT ♥' });
    expect(html).toContain('&hearts;');
    expect(html).not.toContain('♥');
  });

  it('applique un greeting override CMS au format {{firstName}} (substitution double accolade)', () => {
    const html = renderOrderReadyForPickupV3(BASE, { greeting: 'Bonne nouvelle, {{firstName}} !' });
    expect(html).toContain('Bonne nouvelle, Marie !');
    expect(html).not.toContain('{{firstName}}');
  });

  it('ne contient aucun bouton CTA', () => {
    const html = renderOrderReadyForPickupV3(BASE);
    expect(html).not.toMatch(/<a [^>]*background/i);
  });
});
