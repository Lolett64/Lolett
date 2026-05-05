import { sendHtmlEmail } from '@/lib/email-provider';
import { renderWelcomeNewsletterV3 } from './templates/welcome-newsletter-v3';

interface WelcomeNewsletterData {
  to: string;
  firstName?: string;
  promoCode?: string;
}

export async function sendWelcomeNewsletterEmail(
  data: WelcomeNewsletterData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const promoCode = data.promoCode || process.env.NEWSLETTER_WELCOME_CODE || 'BIENVENUE10';

    const html = renderWelcomeNewsletterV3({
      firstName: data.firstName,
      promoCode,
    });

    const fromName = 'LOLETT';
    const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || 'contact.lolett@gmail.com';

    const result = await sendHtmlEmail({
      from: `${fromName} <${fromEmail}>`,
      to: data.to,
      subject: 'Bienvenue chez LOLETT',
      html,
    });

    if (result.success) {
      console.log(`[Email] Welcome newsletter sent to ${data.to}`);
    } else {
      console.error(`[Email] Failed to send welcome newsletter: ${result.error}`);
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Email] Failed to send welcome newsletter:', error);
    return { success: false, error: message };
  }
}
