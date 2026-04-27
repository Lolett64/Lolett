import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { renderLaunchInvitationV3 } from '@/lib/email/templates/launch-invitation-v3';
import { sendHtmlEmail } from '@/lib/email-provider';

const SHOP_PATH = '/shop';
const PARALLELISM = 5;

export async function POST(req: Request) {
  let body: { onlyContactId?: string; subject?: string; retryFailed?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    // body optionnel
  }

  const admin = createAdminClient();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolettshop.com';
  const subject = body.subject?.trim() || 'Lola — l\'ouverture de LOLETT, rien que pour toi';
  const shopUrl = `${baseUrl}${SHOP_PATH}`;

  let query = admin
    .from('pre_launch_contacts')
    .select('id, email, first_name, promo_code, email_status');

  if (body.onlyContactId) {
    query = query.eq('id', body.onlyContactId);
  } else if (body.retryFailed) {
    query = query.in('email_status', ['pending', 'failed']);
  } else {
    query = query.eq('email_status', 'pending');
  }

  const { data: contacts, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!contacts || contacts.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, total: 0 });
  }

  const results = { sent: 0, failed: 0, total: contacts.length };

  for (let i = 0; i < contacts.length; i += PARALLELISM) {
    const batch = contacts.slice(i, i + PARALLELISM);
    await Promise.all(
      batch.map(async (contact) => {
        const promo = await admin
          .from('promo_codes')
          .select('value')
          .eq('code', contact.promo_code)
          .maybeSingle();
        const discountLabel = promo.data?.value ? `-${promo.data.value}%` : '-15%';

        const html = renderLaunchInvitationV3({
          firstName: contact.first_name,
          promoCode: contact.promo_code,
          discountLabel,
          shopUrl,
        });

        const send = await sendHtmlEmail({
          to: contact.email,
          subject,
          html,
        });

        if (send.success) {
          results.sent += 1;
          await admin
            .from('pre_launch_contacts')
            .update({
              email_status: 'sent',
              email_sent_at: new Date().toISOString(),
              email_error: null,
            })
            .eq('id', contact.id);
        } else {
          results.failed += 1;
          await admin
            .from('pre_launch_contacts')
            .update({
              email_status: 'failed',
              email_error: send.error?.slice(0, 500) ?? 'Unknown error',
            })
            .eq('id', contact.id);
        }
      })
    );
  }

  return NextResponse.json(results);
}
