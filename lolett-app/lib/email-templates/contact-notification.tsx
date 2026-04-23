/**
 * CONTACT NOTIFICATION (Admin) — "Luxe Whisper"
 * Matches the order email style: golden accents, Cormorant Garamond, generous whitespace
 */

export interface ContactNotificationProps {
  name: string;
  email: string;
  subject: string;
  message: string;
  sentAt: string;
}

export function renderContactNotification({ name, email, subject, message, sentAt }: ContactNotificationProps): string {
  const replyHref = `mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`;
  const escapedMessage = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nouveau message — LOLETT</title>
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
              <p style="margin: 0; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.25em; color: #C4956A;">Notification admin</p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-weight: 400; font-size: 32px; color: #2C2420; line-height: 1.15;">
                Nouveau message de contact
              </h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <p style="margin: 0; font-size: 12px; color: #9B8E82; letter-spacing: 0.06em;">${sentAt}</p>
            </td>
          </tr>

          <!-- Golden line -->
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <div style="width: 60px; height: 1px; background: #C4956A;"></div>
            </td>
          </tr>

          <!-- Message card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #FFFFFF; border-radius: 16px;">
                <tr>
                  <td style="padding: 32px;">
                    <!-- Name -->
                    <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: #C4956A;">Nom</p>
                    <p style="margin: 0 0 20px; font-size: 15px; color: #2C2420; font-family: 'Cormorant Garamond', Georgia, serif;">${name}</p>

                    <!-- Email -->
                    <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: #C4956A;">Email</p>
                    <p style="margin: 0 0 20px; font-size: 14px; color: #2C2420;">
                      <a href="mailto:${email}" style="color: #2C2420; text-decoration: none;">${email}</a>
                    </p>

                    <!-- Subject -->
                    <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: #C4956A;">Sujet</p>
                    <p style="margin: 0 0 20px; font-size: 15px; color: #2C2420; font-family: 'Cormorant Garamond', Georgia, serif;">${subject}</p>

                    <!-- Separator -->
                    <div style="height: 1px; background: #F0EBE4; margin: 8px 0 20px;"></div>

                    <!-- Message -->
                    <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: #C4956A;">Message</p>
                    <p style="margin: 0; font-size: 14px; color: #5A4D3E; line-height: 1.7;">${escapedMessage}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 32px 0 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: #C4956A; border-radius: 50px; padding: 14px 48px;">
                    <a href="${replyHref}" style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; color: #FFFFFF; text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase;">
                      Répondre à ${name.split(' ')[0]}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center">
              <div style="height: 1px; background: #E8E0D6; margin-bottom: 20px;"></div>
              <p style="margin: 0; font-size: 11px; color: #B5A99A; line-height: 1.8;">
                LOLETT — Mode du Sud-Ouest
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
export function ContactNotification(props: ContactNotificationProps) {
  return null; // Deprecated React component — use renderContactNotification instead
}
export default ContactNotification;
