import { sendHtmlEmail } from '@/lib/email-provider';
import { renderOrderCancelledV3 } from './templates/order-cancelled-v3';
import { getEmailSettings } from '@/lib/cms/emails';

interface CancelledEmailData {
  to: string;
  orderNumber: string;
  firstName: string;
  reason?: string;
  wasPaid?: boolean;
}

export async function sendOrderCancelled(data: CancelledEmailData) {
  try {
    let settings: Awaited<ReturnType<typeof getEmailSettings>> = null;
    try {
      settings = await getEmailSettings('order_cancelled');
    } catch {
      // DB unavailable — use hardcoded defaults
    }

    const overrides = settings ? {
      greeting: settings.greeting,
      body_text: settings.body_text,
      signoff: settings.signoff,
    } : undefined;

    const html = renderOrderCancelledV3({
      firstName: data.firstName,
      orderNumber: data.orderNumber,
      reason: data.reason,
      wasPaid: data.wasPaid,
    }, overrides);

    const fromName = settings?.from_name || 'LOLETT';
    const fromEmail = settings?.from_email || 'onboarding@resend.dev';
    const subject = settings?.subject_template?.replace('{orderNumber}', data.orderNumber)
      || `Votre commande ${data.orderNumber} a été annulée`;

    const result = await sendHtmlEmail({
      from: `${fromName} <${fromEmail}>`,
      to: data.to,
      subject,
      html,
    });

    if (result.success) {
      console.log(`[Email] Cancelled email sent to ${data.to} for ${data.orderNumber}`);
    } else {
      console.error(`[Email] Failed to send cancelled email: ${result.error}`);
    }
  } catch (error) {
    console.error('[Email] Failed to send cancelled email:', error);
  }
}
