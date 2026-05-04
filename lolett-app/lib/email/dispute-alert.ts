import { sendHtmlEmail } from '@/lib/email-provider';

interface DisputeAlertData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  reason: string;
  stripeUrl: string;
  dueBy: string;
}

interface DisputeClosedData {
  orderNumber: string;
  result: 'won' | 'lost' | 'warning_closed' | string;
  amount: number;
  stripeUrl: string;
}

// Mapping des raisons de litige Stripe → français lisible pour Lola.
// Liste officielle : https://stripe.com/docs/api/disputes/object#dispute_object-reason
const DISPUTE_REASON_FR: Record<string, string> = {
  bank_cannot_process: 'Banque incapable de traiter le paiement',
  check_returned: 'Chèque retourné',
  credit_not_processed: 'Avoir non traité',
  customer_initiated: 'Demandé par le client',
  debit_not_authorized: 'Prélèvement non autorisé',
  duplicate: 'Transaction en double',
  fraudulent: 'Fraude signalée par le client',
  general: 'Litige général',
  incorrect_account_details: 'Coordonnées bancaires incorrectes',
  insufficient_funds: 'Fonds insuffisants',
  product_not_received: 'Produit non reçu',
  product_unacceptable: 'Produit non conforme à la description',
  subscription_canceled: 'Abonnement résilié non remboursé',
  unrecognized: 'Transaction non reconnue par le client',
};

function localizeReason(reason: string): string {
  return DISPUTE_REASON_FR[reason] ?? reason;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderDisputeAlert(data: DisputeAlertData): string {
  const safe = {
    orderNumber: escapeHtml(data.orderNumber),
    customerName: escapeHtml(data.customerName),
    customerEmail: escapeHtml(data.customerEmail),
    reason: escapeHtml(localizeReason(data.reason)),
    stripeUrl: escapeHtml(data.stripeUrl),
    dueBy: escapeHtml(data.dueBy),
  };

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"/><title>Litige client URGENT</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1510; background: #fff;">
  <div style="border-left: 4px solid #c00; padding-left: 16px; margin-bottom: 24px;">
    <h1 style="color: #c00; margin: 0; font-size: 20px;">Litige client URGENT</h1>
    <p style="margin: 4px 0 0; color: #666; font-size: 13px;">Action requise sous délai</p>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <tr><td style="padding: 8px 0; color: #666; width: 40%;">Commande</td><td style="padding: 8px 0; font-weight: 600;">${safe.orderNumber}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Client</td><td style="padding: 8px 0;">${safe.customerName}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Email client</td><td style="padding: 8px 0;"><a href="mailto:${safe.customerEmail}" style="color: #1B0B94;">${safe.customerEmail}</a></td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Montant disputé</td><td style="padding: 8px 0; font-weight: 600; color: #c00;">${data.amount.toFixed(2)} €</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Raison Stripe</td><td style="padding: 8px 0;">${safe.reason}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Date limite réponse</td><td style="padding: 8px 0; font-weight: 600;">${safe.dueBy}</td></tr>
  </table>

  <div style="margin: 32px 0;">
    <a href="${safe.stripeUrl}" style="display: inline-block; background: #635bff; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">
      Répondre au litige sur Stripe →
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e8e0d6; margin: 24px 0;"/>

  <div style="background: #FEF9EF; border: 1px solid #F1E6D0; border-radius: 8px; padding: 16px; font-size: 14px;">
    <p style="margin: 0 0 8px; font-weight: 600; color: #B89547;">Preuves à fournir à Stripe :</p>
    <ul style="margin: 0; padding-left: 20px; color: #1a1510;">
      <li>Facture PDF de la commande</li>
      <li>Numéro de tracking + preuve de livraison (Colissimo / Mondial Relay)</li>
      <li>Échanges email avec le client (si applicable)</li>
      <li>Conditions générales de vente acceptées au checkout</li>
    </ul>
  </div>

  <p style="margin-top: 24px; font-size: 12px; color: #888; text-align: center;">
    Email automatique envoyé par lolettshop.com — ne pas répondre.
  </p>
</body>
</html>`;
}

export function renderDisputeClosed(data: DisputeClosedData): string {
  const isWon = data.result === 'won';
  const resultLabel = isWon ? 'GAGNÉ' : data.result === 'lost' ? 'PERDU' : data.result.toUpperCase();
  const color = isWon ? '#16a34a' : '#c00';

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"/><title>Litige clos</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1510;">
  <h1 style="color: ${color};">Litige clos — ${resultLabel}</h1>
  <p>Commande : <strong>${escapeHtml(data.orderNumber)}</strong></p>
  <p>Montant : <strong>${data.amount.toFixed(2)} €</strong></p>
  <p style="margin-top: 24px;">
    <a href="${escapeHtml(data.stripeUrl)}" style="color: #1B0B94;">Voir le détail sur Stripe →</a>
  </p>
</body>
</html>`;
}

export async function sendDisputeAlertToAdmin(data: DisputeAlertData) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('[dispute-alert] ADMIN_EMAIL not set, cannot notify Lola');
    return { success: false, error: 'ADMIN_EMAIL not configured' };
  }

  return sendHtmlEmail({
    to: adminEmail,
    subject: `[URGENT] Litige client sur commande ${data.orderNumber} (${data.amount.toFixed(2)}€)`,
    html: renderDisputeAlert(data),
  });
}

export async function sendDisputeClosedToAdmin(data: DisputeClosedData) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('[dispute-alert] ADMIN_EMAIL not set');
    return { success: false, error: 'ADMIN_EMAIL not configured' };
  }

  const resultLabel = data.result === 'won' ? 'GAGNÉ' : data.result === 'lost' ? 'PERDU' : data.result;
  return sendHtmlEmail({
    to: adminEmail,
    subject: `Litige clos — ${resultLabel} (${data.amount.toFixed(2)}€) — commande ${data.orderNumber}`,
    html: renderDisputeClosed(data),
  });
}
