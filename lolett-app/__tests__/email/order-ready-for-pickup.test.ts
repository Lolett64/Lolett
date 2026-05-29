import { describe, it, expect, vi, beforeEach } from 'vitest';

const { sendHtmlEmailMock, getEmailSettingsMock, captureMessageMock } = vi.hoisted(() => ({
  sendHtmlEmailMock: vi.fn().mockResolvedValue({ success: true }),
  getEmailSettingsMock: vi.fn(),
  captureMessageMock: vi.fn(),
}));

vi.mock('@/lib/email-provider', () => ({
  sendHtmlEmail: sendHtmlEmailMock,
}));

vi.mock('@/lib/cms/emails', () => ({
  getEmailSettings: getEmailSettingsMock,
}));

vi.mock('@sentry/nextjs', () => ({
  captureMessage: captureMessageMock,
  captureException: vi.fn(),
}));

// Import APRÈS les mocks
import { sendOrderReadyForPickupEmail } from '@/lib/email/order-ready-for-pickup';
import type { ClickCollectPickupPoint, MondialRelayPickupPoint } from '@/types';

const PICKUP_POINT: ClickCollectPickupPoint = {
  provider: 'click_collect',
  id: 'pp-1',
  name: 'Boutique du Marais',
  address: '12 rue de Bretagne',
  postalCode: '75003',
  city: 'Paris',
  country: 'FR',
  hours: 'Lun-Sam 10h-19h',
  instructions: "Sonner à l'interphone LOLETT",
};

// Aligné sur le seed PR1 réel : {{var}} (double accolade) + ♥ (U+2665) + ✨
const MOCK_SETTINGS = {
  id: 'row-1',
  template_key: 'order_ready_for_pickup',
  label: 'Commande prête au retrait',
  from_name: 'LOLETT',
  from_email: 'bonjour@lolettshop.com',
  subject_template: 'Votre commande {{orderNumber}} est prête au retrait — code {{pickupCode}}',
  greeting: 'Bonne nouvelle, {{firstName}} ✨',
  body_text: 'Votre commande vous attend au {{pickupPointName}}.',
  cta_text: '',
  cta_url: '',
  signoff: 'Avec amour, LOLETT ♥',
  extra_params: {},
};

describe('sendOrderReadyForPickupEmail', () => {
  beforeEach(() => {
    sendHtmlEmailMock.mockClear();
    getEmailSettingsMock.mockReset();
    captureMessageMock.mockClear();
  });

  it("récupère email_settings('order_ready_for_pickup') et interpole le sujet {{orderNumber}}+{{pickupCode}} — résout undefined", async () => {
    getEmailSettingsMock.mockResolvedValueOnce(MOCK_SETTINGS);

    const ret = await sendOrderReadyForPickupEmail({
      to: 'marie@example.fr',
      firstName: 'Marie',
      orderNumber: 'LOL-20260530-TEST',
      pickupCode: 'LOL-A7K2X',
      pickupPoint: PICKUP_POINT,
    });

    expect(ret).toBeUndefined(); // signature Promise<void>, pas de return result
    expect(getEmailSettingsMock).toHaveBeenCalledWith('order_ready_for_pickup');
    expect(sendHtmlEmailMock).toHaveBeenCalledTimes(1);

    const call = sendHtmlEmailMock.mock.calls[0][0];
    expect(call.to).toBe('marie@example.fr');
    expect(call.subject).toContain('LOL-20260530-TEST');
    expect(call.subject).toContain('LOL-A7K2X');
    // seed en double accolade : les placeholders {{...}} doivent être substitués
    expect(call.subject).not.toContain('{{orderNumber}}');
    expect(call.subject).not.toContain('{{pickupCode}}');
    expect(call.from).toContain('bonjour@lolettshop.com');
    expect(call.replyTo).toBe('bonjour@lolettshop.com');
    expect(call.html).toContain('LOL-A7K2X');
    expect(call.html).toContain('Boutique du Marais');
  });

  it('interpole le greeting CMS {{firstName}} dans le body de l\'email', async () => {
    getEmailSettingsMock.mockResolvedValueOnce(MOCK_SETTINGS);

    await sendOrderReadyForPickupEmail({
      to: 'marie@example.fr',
      firstName: 'Marie',
      orderNumber: 'LOL-20260530-TEST',
      pickupCode: 'LOL-A7K2X',
      pickupPoint: PICKUP_POINT,
    });

    const call = sendHtmlEmailMock.mock.calls[0][0];
    // greeting seed 'Bonne nouvelle, {{firstName}} ✨' → interpolé avec Marie, plus de {{...}}
    expect(call.html).toContain('Bonne nouvelle, Marie');
    expect(call.html).not.toContain('{{firstName}}');
  });

  it("substitue {{pickupPointName}} dans le body quand le template l'utilise", async () => {
    getEmailSettingsMock.mockResolvedValueOnce(MOCK_SETTINGS);

    await sendOrderReadyForPickupEmail({
      to: 'marie@example.fr',
      firstName: 'Marie',
      orderNumber: 'LOL-20260530-TEST',
      pickupCode: 'LOL-A7K2X',
      pickupPoint: PICKUP_POINT,
    });

    const call = sendHtmlEmailMock.mock.calls[0][0];
    // body_text seed contient {{pickupPointName}} → doit être substitué (pas laissé tel quel)
    expect(call.html).toContain('Boutique du Marais');
    expect(call.html).not.toContain('{{pickupPointName}}');
  });

  it("n'envoie PAS d'email si pickupCode est manquant (guard) et capture un message Sentry", async () => {
    getEmailSettingsMock.mockResolvedValue(MOCK_SETTINGS);

    await sendOrderReadyForPickupEmail({
      to: 'marie@example.fr',
      firstName: 'Marie',
      orderNumber: 'LOL-20260530-TEST',
      pickupCode: '',
      pickupPoint: PICKUP_POINT,
    });

    expect(sendHtmlEmailMock).not.toHaveBeenCalled();
    expect(captureMessageMock).toHaveBeenCalledTimes(1);
  });

  it("n'envoie PAS d'email si pickupPoint est null (guard) et capture un message Sentry", async () => {
    getEmailSettingsMock.mockResolvedValue(MOCK_SETTINGS);

    await sendOrderReadyForPickupEmail({
      to: 'marie@example.fr',
      firstName: 'Marie',
      orderNumber: 'LOL-20260530-TEST',
      pickupCode: 'LOL-A7K2X',
      pickupPoint: null,
    });

    expect(sendHtmlEmailMock).not.toHaveBeenCalled();
    expect(captureMessageMock).toHaveBeenCalledTimes(1);
  });

  it("n'envoie PAS d'email si le point n'est pas un click_collect (guard provider)", async () => {
    getEmailSettingsMock.mockResolvedValue(MOCK_SETTINGS);

    const MR_POINT: MondialRelayPickupPoint = {
      provider: 'mondial_relay',
      id: 'mr-1',
      name: 'Tabac du Centre',
      address: '5 place X',
      postalCode: '75001',
      city: 'Paris',
      country: 'FR',
      lat: 48.8566,
      lng: 2.3522,
    };

    await sendOrderReadyForPickupEmail({
      to: 'marie@example.fr',
      firstName: 'Marie',
      orderNumber: 'LOL-20260530-TEST',
      pickupCode: 'LOL-A7K2X',
      pickupPoint: MR_POINT,
    });

    expect(sendHtmlEmailMock).not.toHaveBeenCalled();
    expect(captureMessageMock).toHaveBeenCalledTimes(1);
  });

  it("n'envoie PAS d'email si le point n'a pas de nom (guard)", async () => {
    getEmailSettingsMock.mockResolvedValue(MOCK_SETTINGS);

    await sendOrderReadyForPickupEmail({
      to: 'marie@example.fr',
      firstName: 'Marie',
      orderNumber: 'LOL-20260530-TEST',
      pickupCode: 'LOL-A7K2X',
      pickupPoint: { ...PICKUP_POINT, name: '' },
    });

    expect(sendHtmlEmailMock).not.toHaveBeenCalled();
    expect(captureMessageMock).toHaveBeenCalledTimes(1);
  });

  it('utilise un sujet de repli quand email_settings est null', async () => {
    getEmailSettingsMock.mockResolvedValueOnce(null);

    await sendOrderReadyForPickupEmail({
      to: 'marie@example.fr',
      firstName: 'Marie',
      orderNumber: 'LOL-999',
      pickupCode: 'LOL-ZZZZZ',
      pickupPoint: PICKUP_POINT,
    });

    const call = sendHtmlEmailMock.mock.calls[0][0];
    expect(call.subject).toContain('LOL-999');
    expect(call.subject).toContain('LOL-ZZZZZ');
  });

  it('ne lève pas si getEmailSettings rejette (DB down) et envoie quand même', async () => {
    getEmailSettingsMock.mockRejectedValueOnce(new Error('DB down'));

    await expect(
      sendOrderReadyForPickupEmail({
        to: 'marie@example.fr',
        firstName: 'Marie',
        orderNumber: 'LOL-1',
        pickupCode: 'LOL-AAAAA',
        pickupPoint: PICKUP_POINT,
      })
    ).resolves.toBeUndefined();

    expect(sendHtmlEmailMock).toHaveBeenCalledTimes(1);
  });
});
