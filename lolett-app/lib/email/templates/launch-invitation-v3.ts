/**
 * LAUNCH INVITATION V3 — Email envoyé aux 110 contacts pré-existants à l'ouverture.
 * Ton intime ("Lola t'écrit"), code promo perso single-use.
 */

interface LaunchInvitationData {
  firstName: string;
  promoCode: string;
  discountLabel: string; // ex "-15%"
  shopUrl: string;
  unsubscribeUrl?: string;
}

export function renderLaunchInvitationV3(data: LaunchInvitationData): string {
  const safeName = escapeHtml(data.firstName);
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LOLETT — Et voilà, on y est</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: 'DM Sans', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2;">
    <tr>
      <td align="center" style="padding: 60px 20px;">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%;">

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

          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <p style="margin: 0; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.25em; color: #C4956A;">L'ouverture</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-weight: 400; font-size: 34px; color: #2C2420; line-height: 1.2;">
                ${safeName}, ça y est.
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 8px 28px;">
              <p style="margin: 0 0 16px; font-size: 14px; color: #5A5048; line-height: 1.8;">
                Tu fais partie des premières personnes à qui je voulais l'écrire&nbsp;: <em style="font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; color: #2C2420;">LOLETT</em> ouvre enfin ses portes.
              </p>
              <p style="margin: 0 0 16px; font-size: 14px; color: #5A5048; line-height: 1.8;">
                Une sélection pensée comme je l'aurais faite pour une amie&nbsp;— des coupes qui tombent bien, des matières qu'on aime toucher, et des looks qui se composent en deux clics.
              </p>
              <p style="margin: 0; font-size: 14px; color: #5A5048; line-height: 1.8;">
                Pour te remercier d'être là depuis le début, voici un cadeau&nbsp;: un code rien que pour toi.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 12px 0 36px;">
              <div style="width: 50px; height: 1px; background: #C4956A;"></div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 56px; font-weight: 500; color: #C4956A; line-height: 1;">
                ${escapeHtml(data.discountLabel)}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 13px; color: #9B8E82;">sur ta première commande</p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 32px; border: 1.5px solid #C4956A; border-radius: 50px;">
                    <p style="margin: 0; font-family: 'DM Sans', Helvetica, sans-serif; font-size: 18px; font-weight: 600; color: #C4956A; letter-spacing: 0.1em;">${escapeHtml(data.promoCode)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <p style="margin: 0; font-size: 11px; color: #B5A99A;">À usage unique &middot; valable 90 jours.</p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom: 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #C4956A; border-radius: 50px; padding: 14px 44px;">
                    <a href="${escapeAttr(data.shopUrl)}" style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; color: #FFFFFF; text-decoration: none; letter-spacing: 0.04em;">
                      Découvrir la boutique
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 16px; color: #C4956A;">
                Avec tout mon cœur,<br />Lola &hearts;
              </p>
            </td>
          </tr>

          <tr>
            <td align="center">
              <div style="height: 1px; background: #E8E0D6; margin-bottom: 20px;"></div>
              <p style="margin: 0; font-size: 11px; color: #B5A99A; line-height: 1.8;">
                ${
                  data.unsubscribeUrl
                    ? `<a href="${escapeAttr(data.unsubscribeUrl)}" style="color: #B5A99A; text-decoration: none;">Se désabonner</a>`
                    : ''
                }
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

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
