import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { LEGAL, formatLegalAddress } from '@/lib/legal';
import type { Order } from '@/types';

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: 'Helvetica', color: '#1a1510' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  brandBlock: { width: '50%' },
  brandName: { fontSize: 18, fontWeight: 'bold', letterSpacing: 2, marginBottom: 4 },
  brandLine: { fontSize: 9, color: '#666', marginBottom: 1 },
  invoiceMeta: { width: '40%', textAlign: 'right' },
  invoiceTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  invoiceMetaLine: { fontSize: 9, color: '#444', marginBottom: 2 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#C4956A', borderBottomStyle: 'solid', marginBottom: 24 },
  twoCols: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  col: { width: '48%' },
  colTitle: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, color: '#C4956A', marginBottom: 6 },
  colLine: { fontSize: 10, marginBottom: 2 },
  table: { marginBottom: 24 },
  tableHead: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1a1510', borderBottomStyle: 'solid', paddingBottom: 6, marginBottom: 6 },
  tableRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#E8E0D6', borderBottomStyle: 'solid' },
  cellName: { width: '50%', fontSize: 10 },
  cellQty: { width: '10%', fontSize: 10, textAlign: 'right' },
  cellPrice: { width: '20%', fontSize: 10, textAlign: 'right' },
  cellTotal: { width: '20%', fontSize: 10, textAlign: 'right' },
  cellHead: { fontWeight: 'bold', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 },
  totals: { marginLeft: 'auto', width: '50%', marginTop: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totalLabel: { fontSize: 10, color: '#444' },
  totalValue: { fontSize: 10, color: '#1a1510' },
  totalGrand: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#1a1510', borderTopStyle: 'solid', marginTop: 6 },
  totalGrandLabel: { fontSize: 12, fontWeight: 'bold' },
  totalGrandValue: { fontSize: 14, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 32, left: 48, right: 48, fontSize: 8, color: '#888', textAlign: 'center', borderTopWidth: 0.5, borderTopColor: '#E8E0D6', borderTopStyle: 'solid', paddingTop: 10 },
  vatMention: { marginTop: 16, fontSize: 9, color: '#666', fontStyle: 'italic' },
  retourMention: { marginTop: 8, fontSize: 9, color: '#666' },
});

interface InvoiceTemplateProps {
  invoiceNumber: string;
  invoiceDate: string;
  order: Order;
}

export function InvoiceTemplate({ invoiceNumber, invoiceDate, order }: InvoiceTemplateProps) {
  const customer = order.customer;
  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const promoAmount = Number(order.promoDiscount ?? 0);
  const giftCardAmount = Number(order.giftCardAmount ?? 0);
  const shipping = Number(order.shipping ?? 0);
  const total = Number(order.total ?? 0);

  const isMondialRelay = order.shippingMethod === 'mondial_relay';
  const isClickCollect = order.shippingMethod === 'click_collect';
  const pickup = order.pickupPoint;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>{LEGAL.brandName}</Text>
            <Text style={styles.brandLine}>{LEGAL.legalName}</Text>
            <Text style={styles.brandLine}>{LEGAL.address}</Text>
            <Text style={styles.brandLine}>{LEGAL.postalCode} {LEGAL.city}, {LEGAL.country}</Text>
            <Text style={styles.brandLine}>SIRET : {LEGAL.siret}</Text>
            <Text style={styles.brandLine}>{LEGAL.email}</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>FACTURE</Text>
            <Text style={styles.invoiceMetaLine}>N° {invoiceNumber}</Text>
            <Text style={styles.invoiceMetaLine}>Date : {invoiceDate}</Text>
            <Text style={styles.invoiceMetaLine}>Commande : {order.orderNumber}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.twoCols}>
          <View style={styles.col}>
            <Text style={styles.colTitle}>Facturé à</Text>
            <Text style={styles.colLine}>{customer.firstName} {customer.lastName}</Text>
            <Text style={styles.colLine}>{customer.address}</Text>
            <Text style={styles.colLine}>{customer.postalCode} {customer.city}</Text>
            <Text style={styles.colLine}>{customer.country}</Text>
            <Text style={styles.colLine}>{customer.email}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.colTitle}>
              {isClickCollect
                ? 'Point de retrait Click & Collect'
                : isMondialRelay
                  ? 'Point Relais Mondial Relay'
                  : 'Livraison à domicile'}
            </Text>
            {(isClickCollect || isMondialRelay) && pickup ? (
              <>
                <Text style={styles.colLine}>{pickup.name}</Text>
                <Text style={styles.colLine}>{pickup.address}</Text>
                <Text style={styles.colLine}>{pickup.postalCode} {pickup.city}</Text>
                <Text style={styles.colLine}>{pickup.country}</Text>
                {isClickCollect && pickup.provider === 'click_collect' && pickup.hours ? (
                  <Text style={styles.colLine}>Horaires : {pickup.hours}</Text>
                ) : null}
              </>
            ) : (
              <>
                <Text style={styles.colLine}>{customer.firstName} {customer.lastName}</Text>
                <Text style={styles.colLine}>{customer.address}</Text>
                <Text style={styles.colLine}>{customer.postalCode} {customer.city}</Text>
                <Text style={styles.colLine}>{customer.country}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.cellName, styles.cellHead]}>Article</Text>
            <Text style={[styles.cellQty, styles.cellHead]}>Qté</Text>
            <Text style={[styles.cellPrice, styles.cellHead]}>Prix unit.</Text>
            <Text style={[styles.cellTotal, styles.cellHead]}>Total</Text>
          </View>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.cellName}>{item.productName} {item.size ? `(${item.size})` : ''}</Text>
              <Text style={styles.cellQty}>{item.quantity}</Text>
              <Text style={styles.cellPrice}>{item.price.toFixed(2)} €</Text>
              <Text style={styles.cellTotal}>{(item.price * item.quantity).toFixed(2)} €</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total</Text>
            <Text style={styles.totalValue}>{subtotal.toFixed(2)} €</Text>
          </View>
          {promoAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Code promo {order.promoCode ? `(${order.promoCode})` : ''}</Text>
              <Text style={styles.totalValue}>-{promoAmount.toFixed(2)} €</Text>
            </View>
          )}
          {giftCardAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Carte cadeau {order.giftCardCode ? `(${order.giftCardCode})` : ''}</Text>
              <Text style={styles.totalValue}>-{giftCardAmount.toFixed(2)} €</Text>
            </View>
          )}
          {isClickCollect ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Retrait en boutique (Click & Collect)</Text>
              <Text style={styles.totalValue}>Offert</Text>
            </View>
          ) : (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Frais de livraison</Text>
              <Text style={styles.totalValue}>{shipping === 0 ? 'Offerte' : `${shipping.toFixed(2)} €`}</Text>
            </View>
          )}
          <View style={styles.totalGrand}>
            <Text style={styles.totalGrandLabel}>Total payé TTC</Text>
            <Text style={styles.totalGrandValue}>{total.toFixed(2)} €</Text>
          </View>
        </View>

        <Text style={styles.vatMention}>{LEGAL.vatMention}</Text>
        <Text style={styles.retourMention}>
          Droit de rétractation : 14 jours à compter de la réception (art. L221-18 Code de la consommation).
        </Text>
        <Text style={styles.retourMention}>
          Mode de paiement : Carte bancaire via Stripe — paiement effectué le {invoiceDate}.
        </Text>

        <Text style={styles.footer}>
          {LEGAL.legalName} — {formatLegalAddress()} — SIRET {LEGAL.siret} — {LEGAL.rcs} — {LEGAL.website}
        </Text>
      </Page>
    </Document>
  );
}
