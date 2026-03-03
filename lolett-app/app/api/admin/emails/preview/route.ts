import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getEmailSettings, type EmailSettings } from '@/lib/cms/emails';
import { renderOrderConfirmationV3 } from '@/lib/email/templates/order-confirmation-v3';
import { renderOrderShippedV3 } from '@/lib/email/templates/order-shipped-v3';
import { renderOrderDeliveredV3 } from '@/lib/email/templates/order-delivered-v3';
import { renderWelcomeNewsletterV3 } from '@/lib/email/templates/welcome-newsletter-v3';

const MOCK_ORDER_DATA = {
  firstName: 'Marie',
  orderNumber: 'LOL-20260220-DEMO',
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

const MOCK_SHIPPED_DATA = {
  firstName: 'Marie',
  orderNumber: 'LOL-20260220-DEMO',
  items: MOCK_ORDER_DATA.items,
  subtotal: 238.00,
  shipping: 0,
  total: 238.00,
  address: MOCK_ORDER_DATA.address,
  trackingNumber: 'FR123456789',
};

const MOCK_DELIVERED_DATA = {
  firstName: 'Marie',
  orderNumber: 'LOL-20260220-DEMO',
};

function applyOverrides(html: string, settings: Partial<EmailSettings>): string {
  let result = html;

  if (settings.greeting) {
    // Replace the greeting/title line in the email
    result = result.replace(
      /Merci, .+?\./,
      settings.greeting.replace('{firstName}', 'Marie')
    );
  }
  if (settings.body_text) {
    result = result.replace(
      /Nous préparons vos pièces avec soin\./,
      settings.body_text
    );
    result = result.replace(
      /Merci de rejoindre l'univers LOLETT\. Pour vous souhaiter la bienvenue, voici un cadeau\./,
      settings.body_text
    );
  }
  if (settings.cta_text) {
    result = result.replace(/Suivre ma commande/, settings.cta_text);
    result = result.replace(/Découvrir la collection/, settings.cta_text);
  }
  if (settings.signoff) {
    result = result.replace(/Avec amour, LOLETT &hearts;/g, settings.signoff);
  }

  return result;
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { template_key, overrides } = await request.json();

    if (!template_key) {
      return NextResponse.json({ error: 'template_key est requis' }, { status: 400 });
    }

    // Fetch current settings
    const settings = await getEmailSettings(template_key);
    const merged = { ...settings, ...overrides };

    // Render base HTML
    let html: string;
    if (template_key === 'order_confirmation') {
      html = renderOrderConfirmationV3(MOCK_ORDER_DATA);
    } else if (template_key === 'order_shipped') {
      html = renderOrderShippedV3(MOCK_SHIPPED_DATA);
    } else if (template_key === 'order_delivered') {
      html = renderOrderDeliveredV3(MOCK_DELIVERED_DATA);
    } else if (template_key === 'welcome_newsletter') {
      html = renderWelcomeNewsletterV3(MOCK_WELCOME_DATA);
    } else {
      return NextResponse.json({ error: `Template inconnu: ${template_key}` }, { status: 400 });
    }

    // Apply overrides
    html = applyOverrides(html, merged);

    return NextResponse.json({ html });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
