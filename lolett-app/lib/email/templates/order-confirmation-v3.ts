/**
 * ORDER CONFIRMATION V3 — "Luxe Whisper"
 * Ultra-refined, generous whitespace, thin lines, soft golden touches
 */

interface OrderItem {
  productName: string;
  size: string;
  quantity: number;
  price: number;
}

import type { ShippingMethod, PickupPoint } from '@/types';
import { getEmailSiteUrl } from '@/lib/email/site-url';

interface OrderEmailData {
  firstName: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  promoCode?: string;
  promoDiscount?: number;
  giftCardCode?: string;
  giftCardAmount?: number;
  shippingMethod?: ShippingMethod;
  pickupPoint?: PickupPoint | null;
  phone?: string;
  address: {
    firstName: string;
    lastName: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
  };
}

export interface EmailOverrides {
  greeting?: string;
  body_text?: string;
  cta_text?: string;
  signoff?: string;
}

function buildMapsUrl(p: PickupPoint): string {
  if (typeof p.lat === 'number' && typeof p.lng === 'number' && Number.isFinite(p.lat) && Number.isFinite(p.lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
  }
  const q = encodeURIComponent(`${p.name}, ${p.address}, ${p.postalCode} ${p.city}, ${p.country}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function renderOrderConfirmationV3(data: OrderEmailData, overrides?: EmailOverrides): string {
  const siteUrl = getEmailSiteUrl();
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 18px 0; border-bottom: 1px solid #F5F0EA; font-family: 'DM Sans', Helvetica, Arial, sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin: 0; font-size: 15px; font-weight: 400; color: #2C2420; font-family: 'Cormorant Garamond', Georgia, serif;">${item.productName}</p>
                <p style="margin: 5px 0 0; font-size: 11px; color: #B5A99A; letter-spacing: 0.04em;">Taille ${item.size} &middot; Qté ${item.quantity}</p>
              </td>
              <td style="text-align: right; vertical-align: top; font-size: 14px; font-weight: 500; color: #2C2420; font-family: 'DM Sans', Helvetica, Arial, sans-serif; padding-top: 2px;">
                ${(item.price * item.quantity).toFixed(2)}&nbsp;&euro;
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmation de commande — LOLETT</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: 'DM Sans', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2;">
    <tr>
      <td align="center" style="padding: 60px 20px;">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right: 14px;"><div style="width: 28px; height: 1px; background: #D4CBC0; margin-top: 10px;"></div></td>
                  <td><p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; font-weight: 500; letter-spacing: 0.15em; color: #2C2420;">LOLETT</p></td>
                  <td style="padding-left: 14px;"><div style="width: 28px; height: 1px; background: #D4CBC0; margin-top: 10px;"></div></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title block -->
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <p style="margin: 0; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.25em; color: #C4956A;">Commande confirmée</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-weight: 400; font-size: 38px; color: #2C2420; line-height: 1.15;">
                ${overrides?.greeting?.replace(/\{\{?\s*firstName\s*\}?\}/g, data.firstName) || `Merci, ${data.firstName}.`}
              </h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 16px;">
              <p style="margin: 0; font-size: 13px; color: #B5A99A; line-height: 1.6;">
                ${overrides?.body_text || 'Nous préparons vos pièces avec soin.'}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <p style="margin: 0; font-size: 12px; color: #9B8E82; letter-spacing: 0.06em;">n&deg;${data.orderNumber}</p>
            </td>
          </tr>

          <!-- Thin golden line -->
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <div style="width: 60px; height: 1px; background: #C4956A;"></div>
            </td>
          </tr>

          <!-- Items card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #FFFFFF; border-radius: 16px;">
                <tr>
                  <td style="padding: 32px 32px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${itemsHtml}
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 32px 32px;">
                    <!-- Totals -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 8px;">
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #B5A99A; letter-spacing: 0.03em;">Sous-total</td>
                        <td style="padding: 6px 0; font-size: 12px; color: #B5A99A; text-align: right;">${data.subtotal.toFixed(2)}&nbsp;&euro;</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #B5A99A; letter-spacing: 0.03em;">Livraison</td>
                        <td style="padding: 6px 0; font-size: 12px; color: #B5A99A; text-align: right;">${data.shipping === 0 ? 'Offerte' : `${data.shipping.toFixed(2)}&nbsp;&euro;`}</td>
                      </tr>
                      ${data.promoCode && data.promoDiscount && data.promoDiscount > 0 ? `
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #B5A99A; letter-spacing: 0.03em;">Code promo (${data.promoCode})</td>
                        <td style="padding: 6px 0; font-size: 12px; color: #C4956A; text-align: right;">-${data.promoDiscount.toFixed(2)}&nbsp;&euro;</td>
                      </tr>` : ''}
                      ${data.giftCardCode && data.giftCardAmount && data.giftCardAmount > 0 ? `
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #B5A99A; letter-spacing: 0.03em;">Carte cadeau (${data.giftCardCode})</td>
                        <td style="padding: 6px 0; font-size: 12px; color: #C4956A; text-align: right;">-${data.giftCardAmount.toFixed(2)}&nbsp;&euro;</td>
                      </tr>` : ''}
                      <tr>
                        <td colspan="2" style="padding: 14px 0 0;"><div style="height: 1px; background: #F0EBE4;"></div></td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0 0; font-size: 14px; font-weight: 500; color: #2C2420;">Total TTC</td>
                        <td style="padding: 14px 0 0; font-size: 22px; font-weight: 400; color: #2C2420; text-align: right; font-family: 'Cormorant Garamond', Georgia, serif;">
                          ${data.total.toFixed(2)}&nbsp;&euro;
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 4px 0 0; font-size: 11px; color: #B5A99A; text-align: right; letter-spacing: 0.03em;">
                          Dont TVA 20&nbsp;% : ${(data.total - data.total / 1.20).toFixed(2)}&nbsp;&euro;
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Adresse de livraison ou Point Relais -->
          <tr>
            <td style="padding: 32px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 3px; background: #C4956A; border-radius: 2px;"></td>
                  <td style="padding-left: 18px;">
                    ${data.shippingMethod === 'mondial_relay' && data.pickupPoint ? `
                    <p style="margin: 0 0 6px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: #C4956A;">Point Relais Mondial Relay</p>
                    <p style="margin: 0; font-size: 13px; font-weight: 500; color: #2C2420;">${data.pickupPoint.name}</p>
                    <p style="margin: 3px 0 0; font-size: 13px; color: #7A6E62;">${data.pickupPoint.address}</p>
                    <p style="margin: 3px 0 0; font-size: 13px; color: #7A6E62;">${data.pickupPoint.postalCode} ${data.pickupPoint.city} &middot; ${data.pickupPoint.country}</p>
                    <p style="margin: 10px 0 0;">
                      <a href="${buildMapsUrl(data.pickupPoint)}" style="font-size: 12px; color: #C4956A; text-decoration: none; border-bottom: 1px solid #E8D9C4; padding-bottom: 1px;">Voir sur Google Maps &rarr;</a>
                    </p>
                    ${data.phone ? `<p style="margin: 12px 0 0; font-size: 11px; color: #B5A99A; line-height: 1.5;">Vous serez notifi&eacute; par SMS au ${data.phone} d&egrave;s que votre colis sera disponible au retrait.</p>` : ''}
                    ` : `
                    <p style="margin: 0 0 6px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: #C4956A;">Livraison &agrave; domicile</p>
                    <p style="margin: 0; font-size: 13px; color: #2C2420;">${data.address.firstName} ${data.address.lastName}</p>
                    <p style="margin: 3px 0 0; font-size: 13px; color: #7A6E62;">${data.address.address}</p>
                    <p style="margin: 3px 0 0; font-size: 13px; color: #7A6E62;">${data.address.postalCode} ${data.address.city}</p>
                    ${data.address.country && data.address.country !== 'France' ? `<p style="margin: 3px 0 0; font-size: 13px; color: #7A6E62;">${data.address.country}</p>` : ''}
                    `}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- (CTA "Suivre ma commande" supprimé — pas de page de suivi guest disponible.) -->

          <!-- Sign-off -->
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 16px; color: #C4956A;">
                ${overrides?.signoff?.replace('♥', '&hearts;') || 'Avec amour, LOLETT &hearts;'}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center">
              <div style="height: 1px; background: #E8E0D6; margin-bottom: 20px;"></div>
              <p style="margin: 0; font-size: 11px; color: #B5A99A; line-height: 1.8;">
                <a href="${siteUrl}/mentions-legales" style="color: #B5A99A; text-decoration: none;">Mentions légales</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
