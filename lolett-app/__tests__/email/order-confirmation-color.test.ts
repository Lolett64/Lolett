import { describe, it, expect } from 'vitest';
import { renderOrderConfirmationV3 } from '@/lib/email/templates/order-confirmation-v3';

const BASE = {
  firstName: 'Damien',
  orderNumber: 'LOL-1',
  subtotal: 41.03,
  shipping: 5.9,
  total: 46.93,
  address: {
    firstName: 'Damien', lastName: 'D', address: '1 route', postalCode: '64240', city: 'Hasparren', country: 'France',
  },
};

describe('renderOrderConfirmationV3 — couleur des articles', () => {
  it('affiche la couleur choisie par le client', () => {
    const html = renderOrderConfirmationV3({
      ...BASE,
      items: [{ productName: 'Tee shirt Mission', size: 'L', color: 'Rose', quantity: 1, price: 16.03 }],
    });
    expect(html).toContain('Taille L &middot; Couleur Rose &middot; Qté 1');
  });

  it('n’affiche pas de mention couleur pour un article sans couleur', () => {
    const html = renderOrderConfirmationV3({
      ...BASE,
      items: [{ productName: 'Jogging Thomas', size: 'M', quantity: 1, price: 25 }],
    });
    expect(html).toContain('Taille M &middot; Qté 1');
    expect(html).not.toContain('Couleur');
  });

  it('échappe la couleur (valeur venant du navigateur)', () => {
    const html = renderOrderConfirmationV3({
      ...BASE,
      items: [{ productName: 'Tee', size: 'L', color: '<img src=x>', quantity: 1, price: 10 }],
    });
    expect(html).not.toContain('<img src=x>');
    expect(html).toContain('&lt;img src=x&gt;');
  });
});
