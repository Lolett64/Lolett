import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailData {
  to: string;
  orderNumber: string;
  items: { productName: string; size: string; quantity: number; price: number }[];
  customer: { firstName: string; lastName: string; address: string; city: string; postalCode: string };
  subtotal: number;
  shipping: number;
  total: number;
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  try {
    const itemsHtml = data.items
      .map(
        (item) => `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #e8e4dc;font-family:Georgia,serif;color:#2d2d2d;">
            ${item.productName}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #e8e4dc;text-align:center;color:#666;">
            ${item.size}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #e8e4dc;text-align:center;color:#666;">
            ${item.quantity}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #e8e4dc;text-align:right;font-family:Georgia,serif;color:#2d2d2d;">
            ${(item.price * item.quantity).toFixed(2)}&nbsp;&euro;
          </td>
        </tr>`
      )
      .join('');

    const shippingLabel = data.shipping === 0 ? 'Offerte' : `${data.shipping.toFixed(2)}&nbsp;&euro;`;

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3efe8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3efe8;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="padding:32px 40px 24px;text-align:center;border-bottom:2px solid #c4a44e;">
            <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;letter-spacing:4px;color:#c4a44e;font-weight:400;">
              LOLETT
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:22px;color:#2d2d2d;font-weight:400;">
              Merci pour votre commande !
            </h2>
            <p style="margin:0 0 24px;color:#666;font-size:14px;">
              Commande n&deg; <strong style="color:#2d2d2d;">${data.orderNumber}</strong>
            </p>

            <!-- Items table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <thead>
                <tr style="border-bottom:2px solid #c4a44e;">
                  <th style="padding:8px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#999;font-weight:400;">Article</th>
                  <th style="padding:8px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#999;font-weight:400;">Taille</th>
                  <th style="padding:8px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#999;font-weight:400;">Qt&eacute;</th>
                  <th style="padding:8px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#999;font-weight:400;">Prix</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <!-- Totals -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;">Sous-total</td>
                <td style="padding:6px 0;text-align:right;color:#2d2d2d;font-size:14px;">${data.subtotal.toFixed(2)}&nbsp;&euro;</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;">Livraison</td>
                <td style="padding:6px 0;text-align:right;color:#2d2d2d;font-size:14px;">${shippingLabel}</td>
              </tr>
              <tr>
                <td style="padding:12px 0 0;color:#2d2d2d;font-size:16px;font-weight:bold;border-top:2px solid #c4a44e;">Total</td>
                <td style="padding:12px 0 0;text-align:right;color:#2d2d2d;font-size:16px;font-weight:bold;border-top:2px solid #c4a44e;">${data.total.toFixed(2)}&nbsp;&euro;</td>
              </tr>
            </table>

            <!-- Delivery address -->
            <div style="background:#faf9f7;border:1px solid #e8e4dc;border-radius:4px;padding:16px;margin-bottom:8px;">
              <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#999;">Adresse de livraison</p>
              <p style="margin:0;color:#2d2d2d;font-size:14px;line-height:1.6;">
                ${data.customer.firstName} ${data.customer.lastName}<br>
                ${data.customer.address}<br>
                ${data.customer.postalCode} ${data.customer.city}
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;text-align:center;border-top:1px solid #e8e4dc;">
            <p style="margin:0;font-family:Georgia,serif;font-size:14px;color:#999;">
              &Agrave; bient&ocirc;t sur <span style="color:#c4a44e;letter-spacing:2px;">LOLETT</span>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await resend.emails.send({
      from: 'LOLETT <onboarding@resend.dev>',
      to: data.to,
      subject: `Confirmation de commande ${data.orderNumber}`,
      html,
    });

    console.log(`[Email] Order confirmation sent to ${data.to} for ${data.orderNumber}`);
  } catch (error) {
    console.error('[Email] Failed to send order confirmation:', error);
    // Don't throw — email failure should not block the order
  }
}
