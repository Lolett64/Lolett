import { sendHtmlEmail } from '@/lib/email-provider';
import { renderOrderRefundedV3 } from './templates/order-refunded-v3';
import { getEmailSettings } from '@/lib/cms/emails';

interface RefundedEmailData {
  to: string;
  orderNumber: string;
  firstName: string;
  amount: number;
  reason?: string;
}

export async function sendOrderRefunded(data: RefundedEmailData) {
  try {
    let settings: Awaited<ReturnType<typeof getEmailSettings>> = null;
    try {
      settings = await getEmailSettings('order_refunded');
    } catch {
      // DB unavailable — use hardcoded defaults
    }

    const overrides = settings ? {
      greeting: settings.greeting,
      body_text: settings.body_text,
      signoff: settings.signoff,
    } : undefined;

    const html = renderOrderRefundedV3({
      firstName: data.firstName,
      orderNumber: data.orderNumber,
      amount: data.amount,
      reason: data.reason,
    }, overrides);

    const fromName = settings?.from_name || 'LOLETT';
    const fromEmail = settings?.from_email || 'onboarding@resend.dev';
    const subject = settings?.subject_template?.replace('{orderNumber}', data.orderNumber)
      || `Remboursement effectué — commande ${data.orderNumber}`;

    const result = await sendHtmlEmail({
      from: `${fromName} <${fromEmail}>`,
      to: data.to,
      subject,
      html,
    });

    if (result.success) {
      console.log(`[Email] Refunded email sent to ${data.to} for ${data.orderNumber}`);
    } else {
      console.error(`[Email] Failed to send refunded email: ${result.error}`);
    }
  } catch (error) {
    console.error('[Email] Failed to send refunded email:', error);
  }
}
