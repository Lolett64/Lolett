/**
 * CONTACT ACKNOWLEDGMENT — "Luxe Whisper"
 * Matches the order email style: golden accents, Cormorant Garamond, generous whitespace
 */

export interface ContactAcknowledgmentProps {
  name: string;
}

export function renderContactAcknowledgment({ name }: ContactAcknowledgmentProps): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Message bien reçu — LOLETT</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
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
              <p style="margin: 0; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.25em; color: #C4956A;">Message reçu</p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-weight: 400; font-size: 34px; color: #2C2420; line-height: 1.15;">
                On a bien reçu ton message&nbsp;!
              </h1>
            </td>
          </tr>

          <!-- Body text -->
          <tr>
            <td align="center" style="padding: 16px 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #7A6E62; line-height: 1.7;">
                Bonjour ${name},
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 12px 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #7A6E62; line-height: 1.7;">
                C'est Lola. Je te réponds personnellement sous 24-48h.<br/>
                En attendant, je te laisse flâner dans la boutique&nbsp;✨
              </p>
            </td>
          </tr>

          <!-- Golden line -->
          <tr>
            <td align="center" style="padding: 40px 0;">
              <div style="width: 60px; height: 1px; background: #C4956A;"></div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border: 1px solid #C4956A; border-radius: 50px; padding: 13px 44px;">
                    <a href="https://lolett.fr/shop" style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; color: #C4956A; text-decoration: none; letter-spacing: 0.04em;">
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
                À très vite, Lola &hearts;
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center">
              <div style="height: 1px; background: #E8E0D6; margin-bottom: 20px;"></div>
              <p style="margin: 0; font-size: 11px; color: #B5A99A; line-height: 1.8;">
                LOLETT — Mode du Sud-Ouest
              </p>
              <p style="margin: 4px 0 0; font-size: 11px;">
                <a href="https://lolett.fr" style="color: #B5A99A; text-decoration: none;">lolett.fr</a>
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

// Keep backward-compatible named export
export function ContactAcknowledgment({ name }: ContactAcknowledgmentProps) {
  return null; // Deprecated React component — use renderContactAcknowledgment instead
}
export default ContactAcknowledgment;
