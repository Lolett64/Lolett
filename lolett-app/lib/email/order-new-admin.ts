import { sendHtmlEmail } from '@/lib/email-provider';
import type { ShippingMethod, PickupPoint } from '@/types';

interface AdminOrderAlertData {
  orderId: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    postalCode: string;
    country?: string;
  };
  items: { productName: string; size: string; color?: string | null; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingMethod?: ShippingMethod;
  pickupPoint?: PickupPoint | null;
  promoCode?: string;
  giftCardCode?: string;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderAdminOrderAlert(data: AdminOrderAlertData, baseUrl: string): string {
  const safe = {
    orderNumber: escapeHtml(data.orderNumber),
    name: escapeHtml(`${data.customer.firstName} ${data.customer.lastName}`.trim()),
    email: escapeHtml(data.customer.email),
    phone: escapeHtml(data.customer.phone || ''),
    address: escapeHtml(data.customer.address),
    city: escapeHtml(data.customer.city),
    postal: escapeHtml(data.customer.postalCode),
    country: escapeHtml(data.customer.country || 'France'),
  };

  const isMR = data.shippingMethod === 'mondial_relay';
  const pp = data.pickupPoint;

  const shippingBlock = isMR && pp
    ? `<tr>
        <td style="padding: 10px 0; color: #666; vertical-align: top;">Livraison</td>
        <td style="padding: 10px 0; font-weight: 600;">
          Mondial Relay<br/>
          <span style="font-weight: 400; color: #1a1510;">${escapeHtml(pp.name || '')}</span><br/>
          <span style="font-weight: 400; color: #666; font-size: 13px;">
            ${escapeHtml(pp.address || '')}<br/>
            ${escapeHtml(pp.postalCode || '')} ${escapeHtml(pp.city || '')}
          </span>
        </td>
      </tr>`
    : `<tr>
        <td style="padding: 10px 0; color: #666;">Livraison</td>
        <td style="padding: 10px 0; font-weight: 600;">
          Domicile<br/>
          <span style="font-weight: 400; color: #1a1510;">${safe.address}<br/>${safe.postal} ${safe.city}<br/>${safe.country}</span>
        </td>
      </tr>`;

  const itemsRows = data.items.map(i => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #f0e8dc;">${escapeHtml(i.productName)}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #f0e8dc; color: #666;">${escapeHtml(i.size)}${i.color ? ` · ${escapeHtml(i.color)}` : ''}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #f0e8dc; text-align: center;">${i.quantity}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #f0e8dc; text-align: right;">${(i.price * i.quantity).toFixed(2)} €</td>
    </tr>
  `).join('');

  const adminUrl = `${baseUrl.replace(/\/$/, '')}/admin/orders/${encodeURIComponent(data.orderId)}`;

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"/><title>Nouvelle commande</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #1a1510; background: #fff;">

  <div style="border-left: 4px solid #B89547; padding-left: 16px; margin-bottom: 28px;">
    <p style="margin: 0; color: #B89547; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">Nouvelle commande payée</p>
    <h1 style="margin: 4px 0 0; font-size: 22px; color: #1a1510;">${safe.orderNumber}</h1>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <tr>
      <td style="padding: 10px 0; color: #666; width: 35%;">Client</td>
      <td style="padding: 10px 0; font-weight: 600;">
        ${safe.name}<br/>
        <span style="font-weight: 400; color: #1a1510; font-size: 13px;">
          <a href="mailto:${safe.email}" style="color: #1B0B94; text-decoration: none;">${safe.email}</a>${safe.phone ? `<br/>${safe.phone}` : ''}
        </span>
      </td>
    </tr>
    ${shippingBlock}
    <tr>
      <td style="padding: 10px 0; color: #666;">Total</td>
      <td style="padding: 10px 0; font-weight: 700; font-size: 18px; color: #B89547;">${data.total.toFixed(2)} €</td>
    </tr>
  </table>

  <h2 style="font-size: 14px; color: #1a1510; margin: 28px 0 8px; font-weight: 600;">Articles</h2>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <thead>
      <tr style="background: #FAF7F2;">
        <th style="padding: 10px 12px; text-align: left; font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Produit</th>
        <th style="padding: 10px 12px; text-align: left; font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Taille</th>
        <th style="padding: 10px 12px; text-align: center; font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Qté</th>
        <th style="padding: 10px 12px; text-align: right; font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Total</th>
      </tr>
    </thead>
    <tbody>${itemsRows}</tbody>
    <tfoot>
      <tr><td colspan="3" style="padding: 8px 12px; text-align: right; color: #666;">Sous-total</td><td style="padding: 8px 12px; text-align: right;">${data.subtotal.toFixed(2)} €</td></tr>
      <tr><td colspan="3" style="padding: 8px 12px; text-align: right; color: #666;">Livraison</td><td style="padding: 8px 12px; text-align: right;">${data.shipping.toFixed(2)} €</td></tr>
      ${data.promoCode ? `<tr><td colspan="3" style="padding: 8px 12px; text-align: right; color: #666;">Promo (${escapeHtml(data.promoCode)})</td><td style="padding: 8px 12px; text-align: right; color: #B89547;">appliqué</td></tr>` : ''}
      ${data.giftCardCode ? `<tr><td colspan="3" style="padding: 8px 12px; text-align: right; color: #666;">Carte cadeau (${escapeHtml(data.giftCardCode)})</td><td style="padding: 8px 12px; text-align: right; color: #B89547;">appliquée</td></tr>` : ''}
      <tr><td colspan="3" style="padding: 12px; text-align: right; font-weight: 700; border-top: 2px solid #1a1510;">Total payé</td><td style="padding: 12px; text-align: right; font-weight: 700; border-top: 2px solid #1a1510; font-size: 16px;">${data.total.toFixed(2)} €</td></tr>
    </tfoot>
  </table>

  <div style="margin: 32px 0; text-align: center;">
    <a href="${escapeHtml(adminUrl)}" style="display: inline-block; background: #1B0B94; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
      Préparer cette commande →
    </a>
  </div>

  <p style="margin-top: 24px; font-size: 11px; color: #999; text-align: center;">
    Email automatique envoyé par lolettshop.com — ne pas répondre.
  </p>
</body>
</html>`;
}

export async function sendNewOrderAlertToAdmin(data: AdminOrderAlertData) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('[order-new-admin] ADMIN_EMAIL not set, skipping admin notification');
    return { success: false, error: 'ADMIN_EMAIL not configured' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolettshop.com';

  // Sanitize subject : retire CR/LF (anti header-injection) + cap longueur.
  const cleanFirst = data.customer.firstName.replace(/[\r\n]+/g, ' ').trim();
  const cleanLast = data.customer.lastName.replace(/[\r\n]+/g, ' ').trim();
  const rawSubject = `Nouvelle commande ${data.orderNumber} — ${data.total.toFixed(2)} € — ${cleanFirst} ${cleanLast}`;
  const subject = rawSubject.length > 200 ? rawSubject.slice(0, 197) + '...' : rawSubject;

  return sendHtmlEmail({
    to: adminEmail,
    subject,
    html: renderAdminOrderAlert(data, baseUrl),
  });
}
