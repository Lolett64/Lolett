import { NextRequest, NextResponse } from 'next/server';
import { renderOrderConfirmationV3 } from '@/lib/email/templates/order-confirmation-v3';
import { renderOrderShippedV3 } from '@/lib/email/templates/order-shipped-v3';
import { renderOrderDeliveredV3 } from '@/lib/email/templates/order-delivered-v3';
import { renderWelcomeNewsletterV3 } from '@/lib/email/templates/welcome-newsletter-v3';

const mockItems = [
  { productName: 'Hoodie Émoticoeurs Noir', size: 'M', quantity: 1, price: 89 },
  { productName: 'Jean Alto Brut', size: '32', quantity: 1, price: 75 },
  { productName: 'Sacoche Kev', size: 'TU', quantity: 1, price: 45 },
];

const mockAddress = {
  firstName: 'Lola',
  lastName: 'Senfft',
  address: '12 rue du Hédas',
  postalCode: '64000',
  city: 'Pau',
  country: 'France',
};

function indexPage() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Preview Emails — LOLETT</title>
  <style>
    body { font-family: 'DM Sans', sans-serif; background: #FDF5E6; margin: 0; padding: 40px; }
    h1 { font-family: serif; color: #1B0B94; font-size: 32px; margin-bottom: 8px; }
    p.sub { color: #5a4d3e; font-size: 14px; margin-bottom: 40px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .card { background: white; border-radius: 12px; border: 1px solid rgba(27,11,148,0.08); padding: 24px; transition: box-shadow 0.2s; }
    .card:hover { box-shadow: 0 8px 30px rgba(27,11,148,0.08); }
    .card h3 { font-family: serif; color: #1B0B94; margin: 0 0 4px; font-size: 18px; }
    .card .who { font-size: 12px; color: #B89547; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
    .card p { font-size: 13px; color: #5a4d3e; margin: 0 0 16px; line-height: 1.5; }
    .card a { display: inline-block; background: #1B0B94; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; }
    .card a:hover { background: #B89547; }
  </style>
</head>
<body>
  <h1>Emails LOLETT</h1>
  <p class="sub">6 templates — cliquez pour voir le rendu</p>
  <div class="grid">
    <div class="card">
      <div class="who">&rarr; Client</div>
      <h3>Confirmation de commande</h3>
      <p>Envoyé après le paiement. Récap articles, total, adresse de livraison.</p>
      <a href="?template=order-confirmation" target="_blank">Voir</a>
    </div>
    <div class="card">
      <div class="who">&rarr; Client</div>
      <h3>Commande expédiée</h3>
      <p>Envoyé quand l'admin passe la commande en "expédié".</p>
      <a href="?template=order-shipped" target="_blank">Voir</a>
    </div>
    <div class="card">
      <div class="who">&rarr; Client</div>
      <h3>Commande livrée</h3>
      <p>Envoyé quand l'admin passe en "livré". Invite à laisser un avis.</p>
      <a href="?template=order-delivered" target="_blank">Voir</a>
    </div>
    <div class="card">
      <div class="who">&rarr; Admin</div>
      <h3>Notification contact</h3>
      <p>Reçu par contact.lolett@gmail.com quand un visiteur envoie un message.</p>
      <a href="?template=contact-notification" target="_blank">Voir</a>
    </div>
    <div class="card">
      <div class="who">&rarr; Visiteur</div>
      <h3>Accusé de réception contact</h3>
      <p>Envoyé au visiteur pour confirmer que son message a été reçu.</p>
      <a href="?template=contact-acknowledgment" target="_blank">Voir</a>
    </div>
    <div class="card">
      <div class="who">&rarr; Abonné</div>
      <h3>Bienvenue newsletter</h3>
      <p>Envoyé à l'inscription newsletter avec code promo -10%.</p>
      <a href="?template=welcome-newsletter" target="_blank">Voir</a>
    </div>
  </div>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const template = searchParams.get('template') || 'index';

  let html = '';

  try {
    switch (template) {
      case 'index':
        html = indexPage();
        break;

      case 'order-confirmation':
        html = renderOrderConfirmationV3({
          firstName: 'Lola',
          orderNumber: 'LOL-2026-0042',
          items: mockItems,
          subtotal: 209,
          shipping: 0,
          total: 209,
          address: mockAddress,
        });
        break;

      case 'order-shipped':
        html = renderOrderShippedV3({
          firstName: 'Lola',
          orderNumber: 'LOL-2026-0042',
          items: mockItems,
          subtotal: 209,
          shipping: 0,
          total: 209,
          address: mockAddress,
          trackingNumber: 'FR123456789',
        });
        break;

      case 'order-delivered':
        html = renderOrderDeliveredV3({
          firstName: 'Lola',
          orderNumber: 'LOL-2026-0042',
        });
        break;

      case 'contact-notification': {
        const { renderContactNotification } = await import('@/lib/email-templates/contact-notification');
        html = renderContactNotification({
          name: 'Lyes Triki',
          email: 'lyestriki@yahoo.fr',
          subject: 'Question sur les tailles',
          message: 'Bonjour Lola,\n\nJe voudrais savoir si le Hoodie Émoticoeurs taille grand ou petit ?\n\nMerci !',
          sentAt: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
        });
        break;
      }

      case 'contact-acknowledgment': {
        const { renderContactAcknowledgment } = await import('@/lib/email-templates/contact-acknowledgment');
        html = renderContactAcknowledgment({ name: 'Lyes' });
        break;
      }

      case 'welcome-newsletter':
        html = renderWelcomeNewsletterV3({
          firstName: 'Lola',
          promoCode: 'BIENVENUE10',
        });
        break;

      default:
        return NextResponse.json({ error: 'Template inconnu' }, { status: 404 });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
