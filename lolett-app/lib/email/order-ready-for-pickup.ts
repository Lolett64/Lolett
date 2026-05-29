import * as Sentry from '@sentry/nextjs';
import { sendHtmlEmail } from '@/lib/email-provider';
import { getEmailSettings } from '@/lib/cms/emails';
import {
  renderOrderReadyForPickupV3,
  type EmailOverrides,
} from '@/lib/email/templates/order-ready-for-pickup-v3';
import type { PickupPoint } from '@/types';

interface ReadyForPickupParams {
  to: string;
  firstName: string;
  orderNumber: string;
  pickupCode: string;
  // D1 : union nullable — PR4 passe `updatedOrder.pickup_point` (PickupPoint | null)
  // sans narrowing/cast. Le guard ci-dessous narrowe en ClickCollectPickupPoint.
  pickupPoint: PickupPoint | null;
}

/** Gère à la fois `{var}` et `{{var}}` (le seed PR1 utilise `{{var}}`). */
function interpolate(template: string, vars: Record<string, string>): string {
  return template
    .replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`)
    .replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

/**
 * Sender Click & Collect « commande prête au retrait ».
 * Signature `Promise<void>` (§9.2) : NE renvoie PAS de result — les erreurs
 * sont avalées + capturées Sentry pour ne jamais casser l'appelant (after()).
 */
export async function sendOrderReadyForPickupEmail(
  data: ReadyForPickupParams
): Promise<void> {
  // GUARD (D1) : ne JAMAIS envoyer un email partiel (code, point, ou provider
  // incorrect). Le check `provider !== 'click_collect'` narrowe data.pickupPoint
  // en ClickCollectPickupPoint pour la suite.
  if (
    !data.pickupCode ||
    !data.pickupPoint ||
    data.pickupPoint.provider !== 'click_collect' ||
    !data.pickupPoint.name
  ) {
    Sentry.captureMessage('order-ready-for-pickup: missing or invalid data', {
      level: 'warning',
      tags: { feature: 'click_and_collect', step: 'email' },
      extra: { orderNumber: data.orderNumber },
    });
    return;
  }

  // À partir d'ici, data.pickupPoint est narrowé en ClickCollectPickupPoint.
  const pickupPoint = data.pickupPoint;

  try {
    let settings: Awaited<ReturnType<typeof getEmailSettings>> = null;
    try {
      settings = await getEmailSettings('order_ready_for_pickup');
    } catch {
      // DB indisponible — on retombe sur les valeurs en dur.
    }

    const vars: Record<string, string> = {
      firstName: data.firstName,
      orderNumber: data.orderNumber,
      pickupCode: data.pickupCode,
      pickupPointName: pickupPoint.name,
    };

    const overrides: EmailOverrides | undefined = settings
      ? {
          greeting: interpolate(settings.greeting, vars),
          body_text: interpolate(settings.body_text, vars),
          signoff: settings.signoff,
        }
      : undefined;

    const html = renderOrderReadyForPickupV3(
      {
        firstName: data.firstName,
        orderNumber: data.orderNumber,
        pickupCode: data.pickupCode,
        pickupPoint,
      },
      overrides
    );

    const fromName = settings?.from_name || 'LOLETT';
    const fromEmail = settings?.from_email || 'bonjour@lolettshop.com';
    const subject = settings?.subject_template
      ? interpolate(settings.subject_template, vars)
      : `Votre commande ${data.orderNumber} est prête au retrait — code ${data.pickupCode}`;

    const result = await sendHtmlEmail({
      from: `${fromName} <${fromEmail}>`,
      replyTo: 'bonjour@lolettshop.com',
      to: data.to,
      subject,
      html,
    });

    if (result.success) {
      console.log(
        `[Email] Ready-for-pickup email sent to ${data.to} for ${data.orderNumber}`
      );
    } else {
      console.error(`[Email] Failed to send ready-for-pickup email: ${result.error}`);
    }
    // PAS de `return result` : signature Promise<void> (§9.2).
  } catch (error) {
    console.error('[Email] Failed to send ready-for-pickup email:', error);
    Sentry.captureException(error, {
      tags: { feature: 'click_and_collect', step: 'email' },
      extra: { orderNumber: data.orderNumber },
    });
  }
}
