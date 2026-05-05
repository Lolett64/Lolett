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

function interpolate(template: string, vars: Record<string, string>): string {
  return template
    .replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`)
    .replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

export async function sendOrderCancelled(data: CancelledEmailData) {
  try {
    let settings: Awaited<ReturnType<typeof getEmailSettings>> = null;
    try {
      settings = await getEmailSettings('order_cancelled');
    } catch {
      // DB unavailable — use hardcoded defaults
    }

    const vars = {
      firstName: data.firstName,
      orderNumber: data.orderNumber,
      base_url: process.env.NEXT_PUBLIC_BASE_URL || 'https://lolettshop.com',
    };

    const overrides = settings ? {
      greeting: interpolate(settings.greeting, vars),
      body_text: interpolate(settings.body_text, vars),
      signoff: settings.signoff,
    } : undefined;

    const html = renderOrderCancelledV3({
      firstName: data.firstName,
      orderNumber: data.orderNumber,
      reason: data.reason,
      wasPaid: data.wasPaid,
    }, overrides);

    const fromName = settings?.from_name || 'LOLETT';
    const fromEmail = settings?.from_email || 'contact.lolett@gmail.com';
    const subject = settings?.subject_template
      ? interpolate(settings.subject_template, vars)
      : `Votre commande ${data.orderNumber} a été annulée`;

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

    return result;
  } catch (error) {
    console.error('[Email] Failed to send cancelled email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
