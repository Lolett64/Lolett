import { describe, it, expect } from 'vitest';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { InvoiceTemplate } from '@/lib/invoice/template';
import type { Order } from '@/types';

// Même approche que invoice-click-collect : on lit l'arbre React sans rendu PDF.
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
    if (isValidElement(n)) walk((n as ReactElement<{ children?: ReactNode }>).props?.children);
  };
  walk(node);
  return texts;
}

const ORDER: Order = {
  id: 'o1',
  orderNumber: 'LOL-COLOR-1',
  items: [
    { productId: 'p1', productName: 'Tee shirt Mission', size: 'L', color: 'Rose', quantity: 1, price: 16.03 },
    { productId: 'p2', productName: 'Jogging Thomas', size: 'M', quantity: 1, price: 25 },
  ],
  customer: {
    firstName: 'Damien', lastName: 'D', email: 'd@ex.fr', phone: '',
    address: '1 route', city: 'Hasparren', postalCode: '64240', country: 'France',
  },
  total: 46.93,
  shipping: 5.9,
  status: 'paid',
  createdAt: '2026-09-23T10:00:00Z',
};

describe('InvoiceTemplate — couleur des articles', () => {
  it('affiche la couleur à côté de la taille quand elle est connue', () => {
    const texts = collectTexts(InvoiceTemplate({ invoiceNumber: 'LOL-2026-1', invoiceDate: '23/09/2026', order: ORDER }));
    expect(texts.join('')).toContain('Tee shirt Mission (L · Rose)');
  });

  it('garde l’affichage taille seule pour un article sans couleur', () => {
    const texts = collectTexts(InvoiceTemplate({ invoiceNumber: 'LOL-2026-1', invoiceDate: '23/09/2026', order: ORDER }));
    expect(texts.join('')).toContain('Jogging Thomas (M)');
  });
});
