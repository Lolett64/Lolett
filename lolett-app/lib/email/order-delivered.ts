import { sendHtmlEmail } from '@/lib/email-provider';
import { renderOrderDeliveredV3 } from './templates/order-delivered-v3';
import { getEmailSettings } from '@/lib/cms/emails';

interface DeliveredEmailData {
  to: string;
  orderNumber: string;
  firstName: string;
}

export async function sendOrderDelivered(data: DeliveredEmailData) {
  try {
    let settings: Awaited<ReturnType<typeof getEmailSettings>> = null;
    try {
      settings = await getEmailSettings('order_delivered');
    } catch {
      // DB unavailable — use hardcoded defaults
    }

    const overrides = settings ? {
      greeting: settings.greeting,
      body_text: settings.body_text,
      cta_text: settings.cta_text,
      cta_url: settings.cta_url,
      signoff: settings.signoff,
    } : undefined;

    const html = renderOrderDeliveredV3({
      firstName: data.firstName,
      orderNumber: data.orderNumber,
    }, overrides);

    const fromName = settings?.from_name || 'LOLETT';
    const fromEmail = settings?.from_email || 'onboarding@resend.dev';
    const subject = settings?.subject_template?.replace('{orderNumber}', data.orderNumber)
      || `Votre commande ${data.orderNumber} est arrivée`;

    const result = await sendHtmlEmail({
      from: `${fromName} <${fromEmail}>`,
      to: data.to,
      subject,
      html,
    });

    if (result.success) {
      console.log(`[Email] Delivered email sent to ${data.to} for ${data.orderNumber}`);
    } else {
      console.error(`[Email] Failed to send delivered email: ${result.error}`);
    }
  } catch (error) {
    console.error('[Email] Failed to send delivered email:', error);
  }
}
