import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { renderGiftCardDeliveryV3 } from '@/lib/email/templates/gift-card-delivery-v3';
import { renderGiftCardPurchaseConfirmationV3 } from '@/lib/email/templates/gift-card-purchase-confirmation-v3';

const MOCK_DELIVERY_DATA = {
  recipientName: 'Camille',
  purchaserName: 'Sophie',
  amount: 100,
  code: 'GIFT-1A2B-3C4D-5E6F',
  message:
    "Pour ton anniversaire, offre-toi une pièce qui te rendra rayonnante. Joyeux anniversaire ma belle ! ✨",
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  shopUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://lolettshop.com',
};

const MOCK_PURCHASE_DATA = {
  purchaserName: 'Sophie',
  recipientEmail: 'camille@example.com',
  recipientName: 'Camille',
  amount: 100,
  code: 'GIFT-1A2B-3C4D-5E6F',
};

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const kind = searchParams.get('kind') || 'delivery';

  let html: string;
  if (kind === 'delivery') {
    html = renderGiftCardDeliveryV3(MOCK_DELIVERY_DATA);
  } else if (kind === 'purchase') {
    html = renderGiftCardPurchaseConfirmationV3(MOCK_PURCHASE_DATA);
  } else {
    return NextResponse.json(
      { error: `kind invalide: ${kind}. Utilisez 'delivery' ou 'purchase'.` },
      { status: 400 }
    );
  }

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
