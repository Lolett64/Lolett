import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getEmailSettings } from '@/lib/cms/emails';
import { renderOrderConfirmationV3 } from '@/lib/email/templates/order-confirmation-v3';
import { renderWelcomeNewsletterV3 } from '@/lib/email/templates/welcome-newsletter-v3';
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
    } else if (template_key === 'welcome_newsletter') {
      html = renderWelcomeNewsletterV3(MOCK_WELCOME_DATA);
      subject = settings?.subject_template || 'Bienvenue chez LOLETT';
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
