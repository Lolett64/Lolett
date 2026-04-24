import { NextResponse } from 'next/server';
import { renderLaunchInvitationV3 } from '@/lib/email/templates/launch-invitation-v3';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const firstName = url.searchParams.get('firstName') || 'Marie';
  const promoCode = url.searchParams.get('promoCode') || 'BIENVENUE-MARIE-A8F2';
  const discount = url.searchParams.get('discount') || '15';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

  const html = renderLaunchInvitationV3({
    firstName,
    promoCode,
    discountLabel: `-${discount}%`,
    shopUrl: `${baseUrl}/shop`,
  });

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
