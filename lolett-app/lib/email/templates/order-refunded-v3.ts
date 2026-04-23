/**
 * ORDER REFUNDED V3 — "Luxe Whisper"
 * Confirme au client que le remboursement est effectué.
 * Affiche le montant et, si fournie, la raison.
 */

interface RefundedEmailData {
  firstName: string;
  orderNumber: string;
  amount: number;
  reason?: string;
}

interface EmailOverrides {
  greeting?: string;
  body_text?: string;
  signoff?: string;
}

export function renderOrderRefundedV3(data: RefundedEmailData, overrides?: EmailOverrides): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Remboursement effectué — LOLETT</title>
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

          <!-- Badge -->
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <p style="margin: 0; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.25em; color: #C4956A;">Remboursement effectué</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-weight: 400; font-size: 38px; color: #2C2420; line-height: 1.15;">
                ${overrides?.greeting?.replace('{firstName}', data.firstName) || `${data.firstName}, on t'a remboursé·e`}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td align="center" style="padding: 0 20px 24px;">
              <p style="margin: 0; font-size: 13px; color: #B5A99A; line-height: 1.7;">
                ${overrides?.body_text || 'Le remboursement est en route. Compte 5 à 10 jours ouvrés selon ta banque pour le voir arriver sur ton compte.'}
              </p>
            </td>
          </tr>

          <!-- Order number -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 12px; color: #9B8E82; letter-spacing: 0.06em;">n&deg;${data.orderNumber}</p>
            </td>
          </tr>

          <!-- Amount refunded -->
          <tr>
            <td align="center" style="padding: 0 32px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="background: #FFFFFF; border: 1px solid #EFE6D9; border-radius: 8px; width: 100%;">
                <tr>
                  <td style="padding: 22px 24px; text-align: center;">
                    <p style="margin: 0 0 6px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.22em; color: #C4956A; font-weight: 500;">Montant remboursé</p>
                    <p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 400; color: #2C2420;">${data.amount.toFixed(2)}&nbsp;&euro;</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${data.reason ? `
          <!-- Reason -->
          <tr>
            <td align="center" style="padding: 0 32px 32px;">
              <div style="background: #FFFFFF; border: 1px solid #EFE6D9; border-radius: 8px; padding: 20px 24px;">
                <p style="margin: 0 0 6px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #C4956A; font-weight: 500;">Raison</p>
                <p style="margin: 0; font-size: 13px; color: #2C2420; line-height: 1.6;">${escapeHtml(data.reason)}</p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Golden line -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <div style="width: 60px; height: 1px; background: #C4956A;"></div>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 16px; color: #C4956A;">
                ${overrides?.signoff?.replace('♥', '&hearts;') || 'À très vite, LOLETT &hearts;'}
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
