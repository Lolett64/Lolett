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

function interpolate(template: string, vars: Record<string, string>): string {
  return template
    .replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`)
    .replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

export async function sendOrderRefunded(data: RefundedEmailData) {
  try {
    let settings: Awaited<ReturnType<typeof getEmailSettings>> = null;
    try {
      settings = await getEmailSettings('order_refunded');
    } catch {
      // DB unavailable — use hardcoded defaults
    }

    const amountStr = data.amount.toFixed(2).replace('.', ',');

    const vars = {
      firstName: data.firstName,
      orderNumber: data.orderNumber,
      amount: amountStr,
      refund_amount: amountStr,
      base_url: process.env.NEXT_PUBLIC_BASE_URL || 'https://lolettshop.com',
    };

    const overrides = settings ? {
      greeting: interpolate(settings.greeting, vars),
      body_text: interpolate(settings.body_text, vars),
      signoff: settings.signoff,
    } : undefined;

    const html = renderOrderRefundedV3({
      firstName: data.firstName,
      orderNumber: data.orderNumber,
      amount: data.amount,
      reason: data.reason,
    }, overrides);

    const fromName = settings?.from_name || 'LOLETT';
    const fromEmail = settings?.from_email || 'bonjour@lolettshop.com';
    const subject = settings?.subject_template
      ? interpolate(settings.subject_template, vars)
      : `Remboursement effectué — commande ${data.orderNumber}`;

    const result = await sendHtmlEmail({
      from: `${fromName} <${fromEmail}>`,
      replyTo: 'bonjour@lolettshop.com',
      to: data.to,
      subject,
      html,
    });

    if (result.success) {
      console.log(`[Email] Refunded email sent to ${data.to} for ${data.orderNumber}`);
    } else {
      console.error(`[Email] Failed to send refunded email: ${result.error}`);
    }

    return result;
  } catch (error) {
    console.error('[Email] Failed to send refunded email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
