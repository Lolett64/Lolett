/**
 * WELCOME NEWSLETTER V3 — "Whisper Luxe"
 * Ultra-refined, airy, thin golden accents, code in an outlined pill
 */

interface WelcomeEmailData {
  firstName?: string;
  promoCode: string;
}

export interface EmailOverrides {
  greeting?: string;
  body_text?: string;
  cta_text?: string;
  signoff?: string;
  discount_text?: string;
}

export function renderWelcomeNewsletterV3(data: WelcomeEmailData, overrides?: EmailOverrides): string {
  const name = data.firstName || '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenue chez LOLETT</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: 'DM Sans', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2;">
    <tr>
      <td align="center" style="padding: 60px 20px;">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%;">

          <!-- Logo flanked by lines -->
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

          <!-- Greeting -->
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <p style="margin: 0; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.25em; color: #C4956A;">Bienvenue</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-weight: 400; font-size: 36px; color: #2C2420; line-height: 1.2;">
                ${overrides?.greeting ? overrides.greeting.replace('{firstName}', name) : (name ? `${name}, vous êtes<br />des nôtres.` : `Vous êtes<br />des nôtres.`)}
              </h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 36px;">
              <p style="margin: 0; font-size: 14px; color: #9B8E82; line-height: 1.7; max-width: 360px;">
                ${overrides?.body_text || 'Merci de rejoindre l\'univers LOLETT. Pour vous souhaiter la bienvenue, voici un cadeau.'}
              </p>
            </td>
          </tr>

          <!-- Golden thin line -->
          <tr>
            <td align="center" style="padding-bottom: 36px;">
              <div style="width: 50px; height: 1px; background: #C4956A;"></div>
            </td>
          </tr>

          <!-- -10% -->
          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 56px; font-weight: 500; color: #C4956A; line-height: 1;">
                ${overrides?.discount_text || '-10%'}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 13px; color: #9B8E82;">sur votre première commande</p>
            </td>
          </tr>

          <!-- Code in outlined pill -->
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 32px; border: 1.5px solid #C4956A; border-radius: 50px;">
                    <p style="margin: 0; font-family: 'DM Sans', Helvetica, sans-serif; font-size: 18px; font-weight: 600; color: #C4956A; letter-spacing: 0.1em;">${data.promoCode}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <p style="margin: 0; font-size: 11px; color: #B5A99A;">Valable 30 jours, non cumulable.</p>
            </td>
          </tr>

          <!-- CTA — outline style -->
          <tr>
            <td align="center" style="padding-bottom: 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #C4956A; border-radius: 50px; padding: 14px 44px;">
                    <a href="#" style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; color: #FFFFFF; text-decoration: none; letter-spacing: 0.04em;">
                      ${overrides?.cta_text || 'Découvrir la collection'}
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
