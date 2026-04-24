/**
 * GIFT CARD PURCHASE CONFIRMATION V3 — "Whisper Luxe"
 * Email de confirmation envoyé à l'acheteur après un achat de carte cadeau.
 */

interface GiftCardPurchaseConfirmationData {
  purchaserName?: string;
  recipientEmail: string;
  recipientName?: string;
  amount: number;
  code: string;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatAmount(amount: number): string {
  return `${amount} €`;
}

export function renderGiftCardPurchaseConfirmationV3(
  data: GiftCardPurchaseConfirmationData
): string {
  const purchaserName = data.purchaserName ? escapeHtml(data.purchaserName) : '';
  const recipientEmail = escapeHtml(data.recipientEmail);
  const recipientName = data.recipientName ? escapeHtml(data.recipientName) : '';
  const code = escapeHtml(data.code);
  const amountLabel = escapeHtml(formatAmount(data.amount));

  const greeting = purchaserName
    ? `Merci ${purchaserName}`
    : `Merci pour votre achat`;

  const recipientLabel = recipientName
    ? `${recipientName} (${recipientEmail})`
    : recipientEmail;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmation — Carte cadeau LOLETT</title>
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
              <p style="margin: 0; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.25em; color: #C4956A;">Confirmation</p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-weight: 400; font-size: 34px; color: #2C2420; line-height: 1.2;">
                ${greeting}
              </h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 36px;">
              <p style="margin: 0; font-size: 14px; color: #9B8E82; line-height: 1.7; max-width: 360px;">
                Votre carte cadeau a été envoyée à ${recipientLabel}.
              </p>
            </td>
          </tr>

          <!-- Golden line -->
          <tr>
            <td align="center" style="padding-bottom: 36px;">
              <div style="width: 50px; height: 1px; background: #C4956A;"></div>
            </td>
          </tr>

          <!-- Amount -->
          <tr>
            <td align="center" style="padding-bottom: 4px;">
              <p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 56px; font-weight: 500; color: #C4956A; line-height: 1;">
                ${amountLabel}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 36px;">
              <p style="margin: 0; font-size: 12px; color: #9B8E82; letter-spacing: 0.12em; text-transform: uppercase;">Montant offert</p>
            </td>
          </tr>

          <!-- Code pill -->
          <tr>
            <td align="center" style="padding-bottom: 10px;">
              <p style="margin: 0; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.25em; color: #9B8E82;">Code carte cadeau</p>
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
            <td align="center" style="padding-bottom: 48px;">
              <p style="margin: 0; font-size: 11px; color: #B5A99A; line-height: 1.7; max-width: 340px;">
                Gardez ce code précieusement au cas où le destinataire égarerait son email.
              </p>
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
                LOLETT &middot; lolett.fr
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
