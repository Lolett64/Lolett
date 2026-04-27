/**
 * GIFT CARD DELIVERY V3 — "Whisper Luxe"
 * Email envoyé au destinataire d'une carte cadeau LOLETT.
 */

interface GiftCardDeliveryData {
  recipientName?: string;
  purchaserName?: string;
  amount: number;
  code: string;
  message?: string;
  expiresAt: string; // ISO string
  shopUrl: string;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatExpiry(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatAmount(amount: number): string {
  return `${amount} €`;
}

export function renderGiftCardDeliveryV3(data: GiftCardDeliveryData): string {
  const recipientName = data.recipientName ? escapeHtml(data.recipientName) : '';
  const purchaserName = data.purchaserName ? escapeHtml(data.purchaserName) : '';
  const code = escapeHtml(data.code);
  const message = data.message ? escapeHtml(data.message) : '';
  const shopUrl = escapeHtml(data.shopUrl);
  const amountLabel = escapeHtml(formatAmount(data.amount));
  const expiry = escapeHtml(formatExpiry(data.expiresAt));

  const title = purchaserName
    ? `${purchaserName} vous<br />offre une carte cadeau`
    : `Une carte cadeau<br />pour vous`;

  const greeting = recipientName
    ? `Pour ${recipientName}`
    : `Un cadeau attentionné`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Votre carte cadeau LOLETT</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: 'DM Sans', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2;">
    <tr>
      <td align="center" style="padding: 60px 20px;">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 52px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right: 16px;"><div style="width: 32px; height: 1px; background: #D4CBC0; margin-top: 10px;"></div></td>
                  <td><p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; font-weight: 500; letter-spacing: 0.15em; color: #2C2420;">LOLETT</p></td>
                  <td style="padding-left: 16px;"><div style="width: 32px; height: 1px; background: #D4CBC0; margin-top: 10px;"></div></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Eyebrow -->
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <p style="margin: 0; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.25em; color: #C4956A;">${greeting}</p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-weight: 400; font-size: 34px; color: #2C2420; line-height: 1.2;">
                ${title}
              </h1>
            </td>
          </tr>

          <!-- Golden line -->
          <tr>
            <td align="center" style="padding: 20px 0 32px 0;">
              <div style="width: 50px; height: 1px; background: #C4956A;"></div>
            </td>
          </tr>

          <!-- Amount -->
          <tr>
            <td align="center" style="padding-bottom: 4px;">
              <p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 64px; font-weight: 500; color: #C4956A; line-height: 1;">
                ${amountLabel}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 36px;">
              <p style="margin: 0; font-size: 12px; color: #9B8E82; letter-spacing: 0.12em; text-transform: uppercase;">Carte cadeau LOLETT</p>
            </td>
          </tr>

          ${
            message
              ? `<!-- Personal message -->
          <tr>
            <td align="center" style="padding-bottom: 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top: 1px solid #E8E0D6; border-bottom: 1px solid #E8E0D6; padding: 24px 20px;">
                    <p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 18px; color: #6B6258; line-height: 1.6; text-align: center;">
                      « ${message} »
                    </p>
                    ${
                      purchaserName
                        ? `<p style="margin: 12px 0 0 0; font-size: 11px; color: #B5A99A; text-align: center; letter-spacing: 0.1em; text-transform: uppercase;">— ${purchaserName}</p>`
                        : ''
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
              : ''
          }

          <!-- Code pill -->
          <tr>
            <td align="center" style="padding-bottom: 10px;">
              <p style="margin: 0; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.25em; color: #9B8E82;">Votre code</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 14px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 28px; border: 1.5px solid #C4956A; border-radius: 50px;">
                    <p style="margin: 0; font-family: 'DM Sans', Helvetica, sans-serif; font-size: 16px; font-weight: 600; color: #C4956A; letter-spacing: 0.12em;">${code}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <p style="margin: 0; font-size: 12px; color: #9B8E82;">Valable jusqu'au ${expiry}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <p style="margin: 0; font-size: 11px; color: #B5A99A;">À utiliser au checkout sur lolettshop.com</p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding-bottom: 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #C4956A; border-radius: 50px; padding: 14px 44px;">
                    <a href="${shopUrl}" style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; color: #FFFFFF; text-decoration: none; letter-spacing: 0.04em;">
                      Découvrir la boutique
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
                Avec amour, LOLETT &hearts;
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center">
              <div style="height: 1px; background: #E8E0D6; margin-bottom: 20px;"></div>
              <p style="margin: 0; font-size: 11px; color: #B5A99A; line-height: 1.8;">
                <a href="${shopUrl}" style="color: #B5A99A; text-decoration: none;">lolettshop.com</a>
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
