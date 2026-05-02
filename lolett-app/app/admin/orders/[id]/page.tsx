import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { OrderStatusUpdate } from '@/components/admin/OrderStatusUpdate';
import { RefundDialog } from '@/components/admin/RefundDialog';
import { formatPrice, formatDate } from '@/lib/admin/utils';
import { computeVAT, VAT, SHIPPING_METHODS, SHIPPING_COUNTRIES } from '@/lib/constants';
import { getAlreadyRefundedQtyMap, refundItemKey } from '@/lib/orders/refund-tracking';
import type { PickupPoint, ShippingMethod, ShippingCarrier, ShippingCountryCode } from '@/types';

interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  size: string;
  color: string | null;
  quantity: number;
  price: number;
}

interface OrderDetail {
  id: string;
  order_number: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  total: number;
  shipping: number;
  promo_code: string | null;
  promo_discount: number | null;
  gift_card_code: string | null;
  gift_card_amount: number | null;
  shipping_method: ShippingMethod | null;
  shipping_carrier: ShippingCarrier | null;
  shipping_country: ShippingCountryCode | null;
  pickup_point: PickupPoint | null;
  invoice_number: string | null;
  invoice_pdf_url: string | null;
  status: string;
  payment_provider: string;
  payment_id: string;
  tracking_number: string | null;
  admin_notes: string | null;
  refund_amount: number | null;
  refund_reason: string | null;
  cancel_reason: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  refunded_at: string | null;
  disputed_at: string | null;
  dispute_id: string | null;
  dispute_status: string | null;
  dispute_reason: string | null;
  dispute_amount: number | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

async function getOrder(id: string): Promise<OrderDetail | null> {
  const supabase = createAdminClient();
  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).single(),
    supabase.from('order_items').select('*').eq('order_id', id),
  ]);
  if (!order) return null;
  return { ...order, items: items ?? [] } as OrderDetail;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  const promoDiscount = Number(order.promo_discount ?? 0);
  const giftCardAmount = Number(order.gift_card_amount ?? 0);
  const subtotal = +(order.total + promoDiscount + giftCardAmount - order.shipping).toFixed(2);
  const { vat: vatAmount } = computeVAT(order.total);
  const vatPercent = Math.round(VAT.RATE * 100);

  // Parsing des refunds Stripe pour griser les items déjà remboursés dans le dialog.
  const alreadyRefundedQtyByItemId =
    order.payment_provider === 'stripe'
      ? await buildAlreadyRefundedQtyByItemId(order)
      : {};

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/orders"
          className="font-[family-name:var(--font-montserrat)] flex items-center gap-1.5 text-sm text-[#1a1510]/40 hover:text-[#B89547] transition-colors"
        >
          <ChevronLeft className="size-4" />
          Commandes
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-newsreader)] text-3xl font-light text-[#1a1510] tracking-tight">{order.order_number}</h2>
          <p className="font-[family-name:var(--font-montserrat)] text-sm text-[#B89547]/70 mt-1.5 tracking-wide">
            Créée le {formatDate(order.created_at)}
            {order.updated_at !== order.created_at &&
              ` · Mise à jour le ${formatDate(order.updated_at)}`}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Lifecycle history (shipped / delivered / cancelled / refunded / disputed) */}
      {(order.shipped_at || order.delivered_at || order.cancelled_at || order.refunded_at || order.disputed_at) && (
        <Card className="bg-white border border-gray-200/50 shadow-none rounded-xl">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510]">Historique</CardTitle>
          </CardHeader>
          <CardContent className="font-[family-name:var(--font-montserrat)] flex flex-col gap-2 text-sm">
            {order.shipped_at && (
              <p className="text-[#1a1510]/70">
                <span className="font-medium text-[#1a1510]">Expédiée</span> — {formatDate(order.shipped_at)}
                {order.tracking_number && <span className="text-[#1a1510]/50"> · N° {order.tracking_number}</span>}
              </p>
            )}
            {order.delivered_at && (
              <p className="text-[#1a1510]/70">
                <span className="font-medium text-[#1a1510]">Livrée</span> — {formatDate(order.delivered_at)}
              </p>
            )}
            {order.cancelled_at && (
              <div className="flex flex-col gap-1">
                <p className="text-[#1a1510]/70">
                  <span className="font-medium text-[#1a1510]">Annulée</span> — {formatDate(order.cancelled_at)}
                </p>
                {order.cancel_reason && (
                  <p className="pl-3 text-xs text-[#1a1510]/50 border-l-2 border-[#e8e0d6]">
                    Raison : {order.cancel_reason}
                  </p>
                )}
              </div>
            )}
            {order.refunded_at && (
              <div className="flex flex-col gap-1">
                <p className="text-[#1a1510]/70">
                  <span className="font-medium text-[#1a1510]">Remboursée</span> — {formatDate(order.refunded_at)}
                  {order.refund_amount != null && (
                    <span className="text-[#B89547] font-medium"> · {formatPrice(order.refund_amount)}</span>
                  )}
                </p>
                {order.refund_reason && (
                  <p className="pl-3 text-xs text-[#1a1510]/50 border-l-2 border-[#e8e0d6]">
                    Raison : {order.refund_reason}
                  </p>
                )}
              </div>
            )}
            {order.disputed_at && (
              <div className="flex flex-col gap-1">
                <p className="text-red-700">
                  <span className="font-semibold">Litige ouvert</span> — {formatDate(order.disputed_at)}
                  {order.dispute_amount != null && (
                    <span className="font-semibold"> · {formatPrice(order.dispute_amount)}</span>
                  )}
                </p>
                {order.dispute_reason && (
                  <p className="pl-3 text-xs text-red-600/70 border-l-2 border-red-200">
                    Raison Stripe : {order.dispute_reason}
                  </p>
                )}
                {order.dispute_status && (
                  <p className="pl-3 text-xs text-red-600/70 border-l-2 border-red-200">
                    Statut : {order.dispute_status}
                    {order.dispute_id && (
                      <a
                        href={`https://dashboard.stripe.com/disputes/${order.dispute_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 underline hover:text-red-800"
                      >
                        Voir sur Stripe →
                      </a>
                    )}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer info */}
        <Card className="bg-white border border-gray-200/50 shadow-none rounded-xl">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510]">Client</CardTitle>
          </CardHeader>
          <CardContent className="font-[family-name:var(--font-montserrat)] flex flex-col gap-1 text-sm">
            <p className="font-medium text-[#1a1510]">
              {order.customer.firstName} {order.customer.lastName}
            </p>
            <p className="text-[#1a1510]/60">{order.customer.email}</p>
            {order.customer.phone && (
              <p className="text-[#1a1510]/60">{order.customer.phone}</p>
            )}
          </CardContent>
        </Card>

        {/* Shipping address */}
        <Card className="bg-white border border-gray-200/50 shadow-none rounded-xl">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510]">Adresse de livraison</CardTitle>
          </CardHeader>
          <CardContent className="font-[family-name:var(--font-montserrat)] flex flex-col gap-1 text-sm text-[#1a1510]/60">
            <p>{order.customer.address}</p>
            <p>
              {order.customer.postalCode} {order.customer.city}
            </p>
            <p>{order.customer.country}</p>
          </CardContent>
        </Card>
      </div>

      {/* Mode de livraison + point relais (V1 Mondial Relay) */}
      <Card className="bg-white border border-gray-200/50 shadow-none rounded-xl">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510]">Livraison</CardTitle>
        </CardHeader>
        <CardContent className="font-[family-name:var(--font-montserrat)] flex flex-col gap-3 text-sm">
          <div className="grid grid-cols-2 gap-2 text-[#1a1510]/60">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#1a1510]/40">Mode</p>
              <p className="text-[#1a1510] font-medium">
                {order.shipping_method ? SHIPPING_METHODS[order.shipping_method].label : 'Domicile (legacy)'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#1a1510]/40">Transporteur</p>
              <p className="text-[#1a1510] font-medium capitalize">
                {(order.shipping_carrier ?? 'colissimo').replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#1a1510]/40">Pays</p>
              <p className="text-[#1a1510] font-medium">
                {order.shipping_country
                  ? SHIPPING_COUNTRIES.find((c) => c.code === order.shipping_country)?.name ?? order.shipping_country
                  : order.customer.country}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#1a1510]/40">T&eacute;l&eacute;phone</p>
              <p className="text-[#1a1510] font-medium">
                {order.customer.phone ? (
                  <a href={`tel:${order.customer.phone}`} className="hover:underline">{order.customer.phone}</a>
                ) : '—'}
              </p>
            </div>
          </div>

          {order.pickup_point && (
            <div className="rounded-lg border border-[#E8D9C4] bg-[#FFFBF7] p-4">
              <p className="text-xs uppercase tracking-wider text-[#B89547] font-medium mb-2">
                Point Relais à recopier dans le dashboard MR Pro
              </p>
              <p className="font-medium text-[#1a1510]">{order.pickup_point.name}</p>
              <p className="text-[#1a1510]/70 mt-1">{order.pickup_point.address}</p>
              <p className="text-[#1a1510]/70">
                {order.pickup_point.postalCode} {order.pickup_point.city} · {order.pickup_point.country}
              </p>
              <p className="mt-2 font-mono text-xs text-[#1a1510]/60">
                ID: <span className="text-[#1a1510]">{order.pickup_point.id}</span>
              </p>
            </div>
          )}

          {order.tracking_number && (
            <div className="border-t border-[#F0EBE4] pt-3">
              <p className="text-xs uppercase tracking-wider text-[#1a1510]/40 mb-1">N° de suivi</p>
              <p className="font-mono text-[#1a1510]">{order.tracking_number}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order items */}
      <Card className="bg-white border border-gray-200/50 shadow-none rounded-xl">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510]">Articles</CardTitle>
        </CardHeader>
        <CardContent className="font-[family-name:var(--font-montserrat)] flex flex-col gap-0">
          {order.items.map((item, idx) => (
            <div key={item.id}>
              {idx > 0 && <Separator className="my-3" />}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#1a1510]">{item.product_name}</p>
                  <p className="text-xs text-[#1a1510]/40">
                    Taille : {item.size}
                    {item.color && <> · Couleur : {item.color}</>}
                    {' '}· Quantité : {item.quantity}
                  </p>
                </div>
                <div className="text-sm font-medium">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            </div>
          ))}

          <Separator className="my-4" />
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-sm text-[#1a1510]/60">
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#1a1510]/60">
              <span>Livraison</span>
              <span>{order.shipping === 0 ? 'Gratuite' : formatPrice(order.shipping)}</span>
            </div>
            {order.promo_code && promoDiscount > 0 && (
              <div className="flex justify-between text-sm text-[#1a1510]/60">
                <span>Code promo ({order.promo_code})</span>
                <span className="text-[#B89547]">-{formatPrice(promoDiscount)}</span>
              </div>
            )}
            {order.gift_card_code && giftCardAmount > 0 && (
              <div className="flex justify-between text-sm text-[#1a1510]/60">
                <span>Carte cadeau ({order.gift_card_code})</span>
                <span className="text-[#B89547]">-{formatPrice(giftCardAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-[#1a1510] mt-1">
              <span>Total TTC</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#1a1510]/50">
              <span>Dont TVA {vatPercent}%</span>
              <span>{formatPrice(vatAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facture PDF */}
      {(order.invoice_number || order.invoice_pdf_url) && (
        <Card className="bg-white border border-gray-200/50 shadow-none rounded-xl">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510]">Facture</CardTitle>
          </CardHeader>
          <CardContent className="font-[family-name:var(--font-montserrat)] flex items-center justify-between text-sm">
            <div>
              <p className="text-[#1a1510]/40 text-xs uppercase tracking-wider">Numéro</p>
              <p className="font-mono text-[#1a1510]">{order.invoice_number ?? '—'}</p>
            </div>
            {order.invoice_pdf_url && (
              <a
                href={order.invoice_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#B89547]/30 text-[#B89547] hover:bg-[#FEF9EF] transition-colors text-sm font-medium"
              >
                Télécharger le PDF
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment info */}
      <Card className="bg-white border border-gray-200/50 shadow-none rounded-xl">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510]">Paiement</CardTitle>
        </CardHeader>
        <CardContent className="font-[family-name:var(--font-montserrat)] flex flex-col gap-1 text-sm text-[#1a1510]/60">
          <div className="flex justify-between">
            <span>Fournisseur</span>
            <span className="capitalize font-medium">{order.payment_provider ?? '—'}</span>
          </div>
          {order.payment_id && (
            <div className="flex justify-between">
              <span>ID transaction</span>
              <span className="font-mono text-xs">{order.payment_id}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin notes display (read-only summary, edition via OrderStatusUpdate) */}
      {order.admin_notes && (
        <Card className="bg-[#FEF9EF] border border-[#F1E6D0] shadow-none rounded-xl">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#B89547]">Notes internes</CardTitle>
          </CardHeader>
          <CardContent className="font-[family-name:var(--font-montserrat)] text-sm text-[#1a1510] whitespace-pre-wrap">
            {order.admin_notes}
          </CardContent>
        </Card>
      )}

      {/* Status update */}
      <OrderStatusUpdate
        orderId={order.id}
        currentStatus={order.status}
        currentTrackingNumber={order.tracking_number}
        currentAdminNotes={order.admin_notes}
        currentCancelReason={order.cancel_reason}
      />

      {/* Refund via Stripe (passe par /api/admin/orders/:id/refund) */}
      {order.payment_provider === 'stripe' && (
        <RefundDialog
          orderId={order.id}
          orderTotal={Number(order.total)}
          alreadyRefunded={Number(order.refund_amount ?? 0)}
          status={order.status}
          orderItems={order.items.map(i => ({
            id: i.id,
            product_id: i.product_id,
            product_name: i.product_name,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
            price: Number(i.price),
          }))}
          alreadyRefundedQtyMap={alreadyRefundedQtyByItemId}
        />
      )}
    </div>
  );
}

// Construit { [order_item.id]: qtyDejaRembourse } à partir des refunds Stripe parsés.
async function buildAlreadyRefundedQtyByItemId(order: OrderDetail): Promise<Record<string, number>> {
  if (!order.payment_id || !process.env.STRIPE_SECRET_KEY) return {};
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const refundedMap = await getAlreadyRefundedQtyMap(stripe, order.payment_id);
    const result: Record<string, number> = {};
    for (const item of order.items) {
      // Items legacy avec product_id supprimé : on les marque comme totalement
      // déjà remboursés pour éviter d'afficher "0 déjà remboursé" qui tromperait
      // l'admin. Le RefundDialog les filtre ensuite via i.product_id === null.
      if (!item.product_id) {
        result[item.id] = item.quantity;
        continue;
      }
      const key = refundItemKey(item.product_id, item.size, item.color);
      const qty = refundedMap.get(key) ?? 0;
      if (qty > 0) result[item.id] = qty;
    }
    return result;
  } catch {
    return {};
  }
}
