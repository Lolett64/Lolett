import { renderToBuffer } from '@react-pdf/renderer';
import { createAdminClient } from '@/lib/supabase/admin';
import { InvoiceTemplate } from './template';
import type { Order } from '@/types';

const BUCKET = 'invoices';

export interface InvoiceResult {
  url: string;
  number: string;
  pdf?: Buffer;
}

// Génère la facture PDF d'une commande, l'uploade sur Supabase Storage et
// met à jour orders.invoice_pdf_url + invoice_number. Idempotent : si l'order
// a déjà un invoice_number, le PDF est simplement régénéré et écrasé.
export async function generateInvoicePdf(order: Order): Promise<InvoiceResult> {
  const admin = createAdminClient();
  const year = new Date().getFullYear();

  // Si la facture existe déjà, on garde le numéro pour ne pas casser la
  // séquence légale ; sinon on incrémente atomiquement le compteur annuel.
  let invoiceNumber = order.invoiceNumber;
  if (!invoiceNumber) {
    const { data: nextNum, error: rpcErr } = await admin.rpc('next_invoice_number', { p_year: year });
    if (rpcErr || typeof nextNum !== 'number') {
      throw new Error(`[generateInvoicePdf] next_invoice_number failed: ${rpcErr?.message ?? 'unknown'}`);
    }
    invoiceNumber = `LOL-${year}-${String(nextNum).padStart(5, '0')}`;
  }

  const invoiceDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const pdfBuffer = await renderToBuffer(
    InvoiceTemplate({ invoiceNumber, invoiceDate, order })
  );

  const path = `${order.id}.pdf`;
  const { error: uploadErr } = await admin.storage
    .from(BUCKET)
    .upload(path, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (uploadErr) {
    throw new Error(`[generateInvoicePdf] storage upload failed: ${uploadErr.message}`);
  }

  // URL signée valide 1 an pour que le client puisse télécharger depuis l'email.
  const { data: signed, error: signErr } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  if (signErr || !signed?.signedUrl) {
    throw new Error(`[generateInvoicePdf] sign url failed: ${signErr?.message ?? 'unknown'}`);
  }

  const { error: updateErr } = await admin
    .from('orders')
    .update({
      invoice_number: invoiceNumber,
      invoice_pdf_url: signed.signedUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  if (updateErr) {
    console.error('[generateInvoicePdf] order update failed:', updateErr);
  }

  return { url: signed.signedUrl, number: invoiceNumber, pdf: pdfBuffer };
}
