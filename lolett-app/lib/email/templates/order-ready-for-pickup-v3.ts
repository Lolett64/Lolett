/**
 * ORDER READY FOR PICKUP V3 — "Luxe Whisper"
 * Email Click & Collect : code de retrait + point de retrait. Aucun CTA.
 */

import type { ClickCollectPickupPoint } from '@/types';
import { getEmailSiteUrl } from '@/lib/email/site-url';
import { escapeHtml } from '@/lib/utils/escape-html';

export interface ReadyForPickupEmailData {
  firstName: string;
  orderNumber: string;
  pickupCode: string;
  pickupPoint: ClickCollectPickupPoint;
}

export interface EmailOverrides {
  greeting?: string;
  body_text?: string;
  signoff?: string;
}

export function renderOrderReadyForPickupV3(
  data: ReadyForPickupEmailData,
  overrides?: EmailOverrides
): string {
  const siteUrl = getEmailSiteUrl();
  const p = data.pickupPoint;

  const safe = {
    firstName: escapeHtml(data.firstName),
    orderNumber: escapeHtml(data.orderNumber),
    pickupCode: escapeHtml(data.pickupCode),
    name: escapeHtml(p.name),
    address: escapeHtml(p.address),
    postalCode: escapeHtml(p.postalCode),
    city: escapeHtml(p.city),
    hours: p.hours ? escapeHtml(p.hours) : '',
    instructions: p.instructions ? escapeHtml(p.instructions) : '',
  };

  // greeting/body_text proviennent du CMS admin (surface de confiance, cohérent
  // avec les autres templates v3 qui les injectent tels quels — cf. Note 9).
  // Le regex remplace {firstName} ET {{firstName}} : robustesse si le greeting
  // CMS n'a pas été pré-interpolé par le sender.
  const greeting =
    overrides?.greeting?.replace(/\{\{?\s*firstName\s*\}?\}/g, safe.firstName) ||
    `Bonne nouvelle, ${safe.firstName}.`;
  const bodyText =
    overrides?.body_text ||
    'Votre commande vous attend au point de retrait choisi. Pr&eacute;sentez le code ci-dessous au point de vente.';
  const signoff =
    overrides?.signoff?.replace('♥', '&hearts;').replace('♡', '&hearts;') ||
    'Avec amour, LOLETT &hearts;';

  const hoursRow = safe.hours
    ? `<p style="margin: 10px 0 0; font-size: 13px; color: #7A6E62;">&#9200; Horaires&nbsp;: ${safe.hours}</p>`
    : '';
  const instructionsRow = safe.instructions
    ? `<p style="margin: 6px 0 0; font-size: 13px; color: #7A6E62;">&#128161; Instructions&nbsp;: ${safe.instructions}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Commande prête au retrait — LOLETT</title>
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
              <p style="margin: 0; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.25em; color: #C4956A;">Pr&ecirc;te au retrait</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-weight: 400; font-size: 38px; color: #2C2420; line-height: 1.15;">${greeting}</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 16px;">
              <p style="margin: 0; font-size: 13px; color: #B5A99A; line-height: 1.6;">${bodyText}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 36px;">
              <p style="margin: 0; font-size: 12px; color: #9B8E82; letter-spacing: 0.06em;">n&deg;${safe.orderNumber}</p>
            </td>
          </tr>

          <!-- BLOC CODE DE RETRAIT (hero) -->
          <tr>
            <td align="center" style="padding-bottom: 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #FAF7F2; border: 1px solid #C4956A; border-radius: 16px;">
                <tr>
                  <td align="center" style="padding: 28px 24px;">
                    <p style="margin: 0 0 10px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.18em; color: #C4956A;">Votre code de retrait</p>
                    <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 24px; font-weight: 700; letter-spacing: 0.08em; color: #2C2420;">${safe.pickupCode}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BLOC POINT DE RETRAIT -->
          <tr>
            <td style="padding: 0 8px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 3px; background: #C4956A; border-radius: 2px;"></td>
                  <td style="padding-left: 18px;">
                    <p style="margin: 0 0 6px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: #C4956A;">Point de retrait</p>
                    <p style="margin: 0; font-size: 13px; font-weight: 500; color: #2C2420;">&#128205; ${safe.name}</p>
                    <p style="margin: 3px 0 0; font-size: 13px; color: #7A6E62;">${safe.address}</p>
                    <p style="margin: 3px 0 0; font-size: 13px; color: #7A6E62;">${safe.postalCode} ${safe.city}</p>
                    ${hoursRow}
                    ${instructionsRow}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Thin golden line -->
          <tr>
            <td align="center" style="padding: 40px 0;">
              <div style="width: 60px; height: 1px; background: #C4956A;"></div>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 16px; color: #C4956A;">${signoff}</p>
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
