/**
 * AUTH RECOVERY V3 — "Luxe Whisper"
 *
 * Template HTML statique destiné à être collé dans le dashboard Supabase
 * (Authentication → Email Templates → Reset Password).
 *
 * Aligné sur la DA des emails commande v3 : palette FAF7F2 / 2C2420 / C4956A,
 * Cormorant Garamond + DM Sans, ornements de lignes fines.
 *
 * Variables Supabase utilisables :
 *   {{ .ConfirmationURL }}  → URL complète de reset (préférée)
 *   {{ .SiteURL }}          → https://lolettshop.com
 *   {{ .Email }}            → email du destinataire
 */
export const AUTH_RECOVERY_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Réinitialisez votre mot de passe — LOLETT</title>
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

          <!-- Eyebrow -->
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <p style="margin: 0; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.25em; color: #C4956A;">Mot de passe oublié</p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-weight: 400; font-size: 38px; color: #2C2420; line-height: 1.15;">
                Réinitialisez votre&nbsp;mot de&nbsp;passe
              </h1>
            </td>
          </tr>

          <!-- Body text -->
          <tr>
            <td align="center" style="padding: 0 24px 36px;">
              <p style="margin: 0; font-size: 14px; color: #7A6E62; line-height: 1.75;">
                Vous avez demandé à réinitialiser le mot de passe de votre compte LOLETT.<br/>
                Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #1B0B94; border-radius: 2px;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 44px; font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: #FAF7F2; text-decoration: none;">
                      Choisir un nouveau mot de passe
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td align="center" style="padding: 0 24px 40px;">
              <p style="margin: 0; font-size: 11px; color: #B5A99A; line-height: 1.7;">
                Le bouton ne fonctionne pas&nbsp;? Copiez ce lien dans votre navigateur&nbsp;:<br/>
                <a href="{{ .ConfirmationURL }}" style="color: #C4956A; text-decoration: none; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>

          <!-- Soft divider -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <div style="height: 1px; background: #E8E0D6; width: 60px; margin: 0 auto;"></div>
            </td>
          </tr>

          <!-- Security note -->
          <tr>
            <td align="center" style="padding: 0 24px 40px;">
              <p style="margin: 0; font-size: 12px; color: #B5A99A; line-height: 1.7;">
                Ce lien est valable <strong style="color: #7A6E62; font-weight: 500;">1&nbsp;heure</strong>.<br/>
                Si vous n'avez pas fait cette demande, ignorez simplement cet email — votre mot de passe restera inchangé.
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
                <a href="{{ .SiteURL }}/mentions-legales" style="color: #B5A99A; text-decoration: none;">Mentions légales</a>
                &nbsp;&middot;&nbsp;
                <a href="{{ .SiteURL }}/contact" style="color: #B5A99A; text-decoration: none;">Contact</a>
              </p>
              <p style="margin: 12px 0 0; font-size: 10px; color: #C4BBAA; line-height: 1.6;">
                LOLETT — Mode du Sud-Ouest<br/>
                Cet email vous a été envoyé à {{ .Email }}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
