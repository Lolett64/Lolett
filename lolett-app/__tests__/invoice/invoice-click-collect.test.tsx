import { describe, it, expect } from 'vitest';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { InvoiceTemplate } from '@/lib/invoice/template';
import type { Order } from '@/types';

// @react-pdf/renderer (v4) ne monte pas un DOM HTML interrogeable sous jsdom
// (ses primitives Document/Page/Text lèvent un proxy trap sur les styles).
// On inspecte donc directement l'arbre d'éléments React produit par
// InvoiceTemplate (sans rendu DOM) et on concatène les nœuds texte.
function collectTexts(node: ReactNode): string[] {
  const texts: string[] = [];
  const walk = (n: ReactNode): void => {
    if (n == null || typeof n === 'boolean') return;
    if (typeof n === 'string' || typeof n === 'number') {
      texts.push(String(n));
      return;
    }
    if (Array.isArray(n)) {
      n.forEach(walk);
      return;
    }
    if (isValidElement(n)) {
      const props = (n as ReactElement<{ children?: ReactNode }>).props;
      walk(props?.children);
    }
  };
  walk(node);
  return texts;
}

// Concatène les segments texte adjacents pour reconstituer une ligne logique
// (ex. "Horaires : " + "Lun-Sam 10h-19h"). On reconstruit aussi la chaîne
// complète pour les `includes` multi-segments.
function renderText(node: ReactNode): string {
  return collectTexts(node).join('');
}

const BASE_ORDER: Order = {
  id: 'o1',
  orderNumber: 'LOL-CC-1',
  items: [{ productId: 'p1', productName: 'Robe Lola', size: 'M', quantity: 1, price: 49.9 }],
  customer: {
    firstName: 'Marie', lastName: 'Durand', email: 'marie@ex.fr', phone: '+33612345678',
    address: '1 rue de Paris', city: 'Paris', postalCode: '75001', country: 'France',
  },
  total: 49.9,
  shipping: 0,
  status: 'paid',
  shippingMethod: 'click_collect',
  shippingCarrier: 'click_collect',
  shippingCountry: 'FR',
  pickupPoint: {
    provider: 'click_collect',
    id: 'pt-1',
    name: 'Boutique du Marais',
    address: '12 rue des Archives',
    postalCode: '75004',
    city: 'Paris',
    country: 'FR',
    hours: 'Lun-Sam 10h-19h',
    instructions: null,
  },
  createdAt: '2026-05-29T10:00:00Z',
};

describe('InvoiceTemplate — Click & Collect', () => {
  it('affiche le bloc Point de retrait Click & Collect avec horaires', () => {
    const tree = InvoiceTemplate({ invoiceNumber: 'LOL-2026-00001', invoiceDate: '29/05/2026', order: BASE_ORDER });
    const texts = collectTexts(tree);
    const joined = renderText(tree);
    expect(texts).toContain('Point de retrait Click & Collect');
    expect(texts).toContain('Boutique du Marais');
    expect(texts).toContain('12 rue des Archives');
    expect(joined).toContain('Horaires : Lun-Sam 10h-19h');
  });

  it('affiche la ligne frais "Retrait en boutique" / "Offert"', () => {
    const tree = InvoiceTemplate({ invoiceNumber: 'LOL-2026-00001', invoiceDate: '29/05/2026', order: BASE_ORDER });
    const texts = collectTexts(tree);
    expect(texts).toContain('Retrait en boutique (Click & Collect)');
    expect(texts).toContain('Offert');
  });

  it('conserve le bloc Facturé à (adresse client obligatoire)', () => {
    const tree = InvoiceTemplate({ invoiceNumber: 'LOL-2026-00001', invoiceDate: '29/05/2026', order: BASE_ORDER });
    const texts = collectTexts(tree);
    expect(texts).toContain('1 rue de Paris');
  });
});
