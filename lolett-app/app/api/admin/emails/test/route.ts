import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getEmailSettings } from '@/lib/cms/emails';
import { renderOrderConfirmationV3 } from '@/lib/email/templates/order-confirmation-v3';
import { renderOrderShippedV3 } from '@/lib/email/templates/order-shipped-v3';
import { renderOrderDeliveredV3 } from '@/lib/email/templates/order-delivered-v3';
import { renderOrderCancelledV3 } from '@/lib/email/templates/order-cancelled-v3';
import { renderOrderRefundedV3 } from '@/lib/email/templates/order-refunded-v3';
import { renderWelcomeNewsletterV3 } from '@/lib/email/templates/welcome-newsletter-v3';
import { renderOrderReadyForPickupV3 } from '@/lib/email/templates/order-ready-for-pickup-v3';
import { sendHtmlEmail } from '@/lib/email-provider';

const MOCK_ORDER_DATA = {
  firstName: 'Marie',
  orderNumber: 'LOL-20260220-TEST',
  items: [
    { productName: 'Blazer Riviera', size: 'M', quantity: 1, price: 149.00 },
    { productName: 'Pantalon Palazzo', size: '38', quantity: 1, price: 89.00 },
  ],
  subtotal: 238.00,
  shipping: 0,
  total: 238.00,
  address: {
    firstName: 'Marie',
    lastName: 'Dupont',
    address: '12 rue de la Paix',
    postalCode: '75002',
    city: 'Paris',
    country: 'France',
  },
};

const MOCK_WELCOME_DATA = {
  firstName: 'Marie',
  promoCode: 'BIENVENUE10',
};

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { template_key, recipient } = await request.json();

    if (!template_key || !recipient) {
      return NextResponse.json({ error: 'template_key et recipient sont requis' }, { status: 400 });
    }

    // Fetch settings
    const settings = await getEmailSettings(template_key);

    // Render HTML
    let html: string;
    let subject: string;

    if (template_key === 'order_confirmation') {
      html = renderOrderConfirmationV3(MOCK_ORDER_DATA);
      subject = settings?.subject_template?.replace('{orderNumber}', 'LOL-20260220-TEST')
        || 'Confirmation de commande — LOLETT';
    } else if (template_key === 'order_shipped') {
      html = renderOrderShippedV3({
        ...MOCK_ORDER_DATA,
        trackingNumber: 'FR123456789',
      });
      subject = settings?.subject_template?.replace('{orderNumber}', 'LOL-20260220-TEST')
        || 'Votre commande est en route — LOLETT';
    } else if (template_key === 'order_delivered') {
      html = renderOrderDeliveredV3({
        firstName: 'Marie',
        orderNumber: 'LOL-20260220-TEST',
      });
      subject = settings?.subject_template?.replace('{orderNumber}', 'LOL-20260220-TEST')
        || 'Votre commande est arrivée — LOLETT';
    } else if (template_key === 'order_cancelled') {
      html = renderOrderCancelledV3({
        firstName: 'Marie',
        orderNumber: 'LOL-20260220-TEST',
        reason: 'Produit en rupture de stock',
        wasPaid: true,
      });
      subject = settings?.subject_template
        ?.replace('{{orderNumber}}', 'LOL-20260220-TEST')
        .replace('{orderNumber}', 'LOL-20260220-TEST')
        || 'Votre commande LOL-20260220-TEST a été annulée';
    } else if (template_key === 'order_refunded') {
      html = renderOrderRefundedV3({
        firstName: 'Marie',
        orderNumber: 'LOL-20260220-TEST',
        amount: 238.00,
        reason: 'Retour accepté',
      });
      subject = settings?.subject_template
        ?.replace('{{orderNumber}}', 'LOL-20260220-TEST')
        .replace('{orderNumber}', 'LOL-20260220-TEST')
        || 'Remboursement confirmé pour votre commande LOL-20260220-TEST';
    } else if (template_key === 'welcome_newsletter') {
      html = renderWelcomeNewsletterV3(MOCK_WELCOME_DATA);
      subject = settings?.subject_template || 'Bienvenue chez LOLETT';
    } else if (template_key === 'order_ready_for_pickup') {
      html = renderOrderReadyForPickupV3(
        {
          firstName: 'Marie',
          orderNumber: 'LOL-20260530-TEST',
          pickupCode: 'LOL-A7K2X',
          pickupPoint: {
            provider: 'click_collect',
            id: 'pp-demo',
            name: 'Boutique du Marais',
            address: '12 rue de Bretagne',
            postalCode: '75003',
            city: 'Paris',
            country: 'FR',
            hours: 'Lun-Sam 10h-19h',
            instructions: "Sonner à l'interphone LOLETT",
          },
        },
        settings
          ? { greeting: settings.greeting, body_text: settings.body_text, signoff: settings.signoff }
          : undefined
      );
      subject = settings?.subject_template
        ?.replace('{{orderNumber}}', 'LOL-20260530-TEST')
        .replace('{orderNumber}', 'LOL-20260530-TEST')
        .replace('{{pickupCode}}', 'LOL-A7K2X')
        .replace('{pickupCode}', 'LOL-A7K2X')
        || 'Votre commande LOL-20260530-TEST est prête au retrait — code LOL-A7K2X';
    } else {
      return NextResponse.json({ error: `Template inconnu: ${template_key}` }, { status: 400 });
    }

    // Apply settings overrides
    if (settings?.signoff) {
      html = html.replace(/Avec amour, LOLETT &hearts;/g, settings.signoff);
    }

    const fromName = settings?.from_name || 'LOLETT';
    const fromEmail = settings?.from_email || 'onboarding@resend.dev';

    const result = await sendHtmlEmail({
      from: `${fromName} <${fromEmail}>`,
      to: recipient,
      subject: `[TEST] ${subject}`,
      html,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, recipient });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
