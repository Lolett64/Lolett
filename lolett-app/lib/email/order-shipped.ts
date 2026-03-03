import { sendHtmlEmail } from '@/lib/email-provider';
import { renderOrderShippedV3 } from './templates/order-shipped-v3';
import { getEmailSettings } from '@/lib/cms/emails';

interface OrderShippedData {
  to: string;
  orderNumber: string;
  items: { productName: string; size: string; quantity: number; price: number }[];
  customer: { firstName: string; lastName: string; address: string; city: string; postalCode: string; country?: string };
  subtotal: number;
  shipping: number;
  total: number;
  trackingNumber?: string;
}

export async function sendOrderShipped(data: OrderShippedData) {
  try {
    let settings: Awaited<ReturnType<typeof getEmailSettings>> = null;
    try {
      settings = await getEmailSettings('order_shipped');
    } catch {
      // DB unavailable — use hardcoded defaults
    }

    const overrides = settings ? {
      greeting: settings.greeting,
      body_text: settings.body_text,
      cta_text: settings.cta_text,
      signoff: settings.signoff,
    } : undefined;

    const html = renderOrderShippedV3({
      firstName: data.customer.firstName,
      orderNumber: data.orderNumber,
      items: data.items,
      subtotal: data.subtotal,
      shipping: data.shipping,
      total: data.total,
      address: {
        firstName: data.customer.firstName,
        lastName: data.customer.lastName,
        address: data.customer.address,
        postalCode: data.customer.postalCode,
        city: data.customer.city,
        country: data.customer.country || 'France',
      },
      trackingNumber: data.trackingNumber,
    }, overrides);

    const fromName = settings?.from_name || 'LOLETT';
    const fromEmail = settings?.from_email || 'onboarding@resend.dev';
    const subject = settings?.subject_template?.replace('{orderNumber}', data.orderNumber)
      || `Votre commande ${data.orderNumber} est en route`;

    const result = await sendHtmlEmail({
      from: `${fromName} <${fromEmail}>`,
      to: data.to,
      subject,
      html,
    });

    if (result.success) {
      console.log(`[Email] Order shipped sent to ${data.to} for ${data.orderNumber}`);
    } else {
      console.error(`[Email] Failed to send order shipped: ${result.error}`);
    }
  } catch (error) {
    console.error('[Email] Failed to send order shipped:', error);
  }
}
