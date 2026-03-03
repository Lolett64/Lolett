/**
 * ORDER DELIVERED V3 — "Luxe Whisper"
 * Simplified: no items, no address, no totals — just a warm delivery notice + review CTA
 */

interface DeliveredEmailData {
  firstName: string;
  orderNumber: string;
}

interface EmailOverrides {
  greeting?: string;
  body_text?: string;
  cta_text?: string;
  cta_url?: string;
  signoff?: string;
}

export function renderOrderDeliveredV3(data: DeliveredEmailData, overrides?: EmailOverrides): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Commande livrée — LOLETT</title>
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

          <!-- Title badge -->
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <p style="margin: 0; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.25em; color: #C4956A;">Commande livrée</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-weight: 400; font-size: 38px; color: #2C2420; line-height: 1.15;">
                ${overrides?.greeting?.replace('{firstName}', data.firstName) || `${data.firstName}, votre commande est arrivée\u00A0!`}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td align="center" style="padding-bottom: 16px;">
              <p style="margin: 0; font-size: 13px; color: #B5A99A; line-height: 1.6;">
                ${overrides?.body_text || 'On espère que vos nouvelles pièces vous plaisent autant qu\u2019à nous.'}
              </p>
            </td>
          </tr>

          <!-- Order number -->
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

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 8px 0 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border: 1px solid #C4956A; border-radius: 50px; padding: 13px 44px;">
                    <a href="${overrides?.cta_url || '#'}" style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; color: #C4956A; text-decoration: none; letter-spacing: 0.04em;">
                      ${overrides?.cta_text || 'Donner mon avis'}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

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
                <a href="#" style="color: #B5A99A; text-decoration: none;">Se désabonner</a> &middot; <a href="#" style="color: #B5A99A; text-decoration: none;">Mentions légales</a>
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
