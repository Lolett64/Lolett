import { describe, it, expect } from 'vitest';
import { renderOrderConfirmationV3 } from '@/lib/email/templates/order-confirmation-v3';
import type { ClickCollectPickupPoint, MondialRelayPickupPoint } from '@/types';

const ADDRESS = {
  firstName: 'Marie',
  lastName: 'Dupont',
  address: '12 rue de la Paix',
  postalCode: '75002',
  city: 'Paris',
  country: 'France',
};

const BASE = {
  firstName: 'Marie',
  orderNumber: 'LOL-1',
  items: [{ productName: 'Blazer', size: 'M', quantity: 1, price: 149 }],
  subtotal: 149,
  shipping: 0,
  total: 149,
  address: ADDRESS,
};

const MR_POINT: MondialRelayPickupPoint = {
  provider: 'mondial_relay',
  id: 'mr-1',
  name: 'Tabac du Centre',
  address: '5 place X',
  postalCode: '75001',
  city: 'Paris',
  country: 'FR',
  lat: 48.8566,
  lng: 2.3522,
};

const CC_POINT: ClickCollectPickupPoint = {
  provider: 'click_collect',
  id: 'cc-1',
  name: 'Boutique du Marais',
  address: '12 rue de Bretagne',
  postalCode: '75003',
  city: 'Paris',
  country: 'FR',
  hours: 'Lun-Sam 10h-19h',
  instructions: null,
};

describe('renderOrderConfirmationV3 — bloc point de retrait', () => {
  it('affiche le titre Mondial Relay + lien Google Maps pour un point mondial_relay', () => {
    const html = renderOrderConfirmationV3({
      ...BASE,
      shippingMethod: 'mondial_relay',
      pickupPoint: MR_POINT,
    });
    expect(html).toContain('Point Relais Mondial Relay');
    expect(html).toContain('Tabac du Centre');
    expect(html).toContain('google.com/maps');
  });

  it('affiche le titre Click & Collect + la mention du futur email pour un point click_collect (sans lien Maps)', () => {
    const html = renderOrderConfirmationV3({
      ...BASE,
      shippingMethod: 'click_collect',
      pickupPoint: CC_POINT,
    });
    expect(html).toContain('Point de retrait Click &amp; Collect');
    expect(html).toContain('Boutique du Marais');
    expect(html).toContain('code de retrait d&egrave;s que votre commande sera pr&ecirc;te');
    expect(html).not.toContain('google.com/maps');
  });

  it("affiche l'adresse domicile quand il n'y a pas de point", () => {
    const html = renderOrderConfirmationV3({ ...BASE, shippingMethod: 'home' });
    expect(html).toContain('Livraison &agrave; domicile');
    expect(html).toContain('12 rue de la Paix');
  });
});
