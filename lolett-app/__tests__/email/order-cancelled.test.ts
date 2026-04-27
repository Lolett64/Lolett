import { describe, it, expect, vi, beforeEach } from 'vitest';

const { sendHtmlEmailMock, getEmailSettingsMock } = vi.hoisted(() => ({
  sendHtmlEmailMock: vi.fn().mockResolvedValue({ success: true }),
  getEmailSettingsMock: vi.fn(),
}));

vi.mock('@/lib/email-provider', () => ({
  sendHtmlEmail: sendHtmlEmailMock,
}));

vi.mock('@/lib/cms/emails', () => ({
  getEmailSettings: getEmailSettingsMock,
}));

// Import AFTER mocks are registered
import { sendOrderCancelled } from '@/lib/email/order-cancelled';

const MOCK_SETTINGS = {
  id: 'row-1',
  template_key: 'order_cancelled',
  label: 'Commande annulée',
  from_name: 'LOLETT',
  from_email: 'contact.lolett@gmail.com',
  subject_template: 'Votre commande {{orderNumber}} a été annulée',
  greeting: '{{firstName}}, on a annulé ta commande',
  body_text: 'Désolé·e {{firstName}} pour la commande {{orderNumber}}.',
  cta_text: 'Voir mes commandes',
  cta_url: 'https://lolettshop.com/compte/commandes',
  signoff: 'À bientôt, LOLETT ♥',
  extra_params: {},
};

describe('sendOrderCancelled', () => {
  beforeEach(() => {
    sendHtmlEmailMock.mockClear();
    getEmailSettingsMock.mockReset();
  });

  it('fetches email_settings for order_cancelled and interpolates orderNumber in subject', async () => {
    getEmailSettingsMock.mockResolvedValueOnce(MOCK_SETTINGS);

    const result = await sendOrderCancelled({
      to: 'camille@example.fr',
      firstName: 'Camille',
      orderNumber: 'LOL-123',
    });

    expect(getEmailSettingsMock).toHaveBeenCalledWith('order_cancelled');
    expect(sendHtmlEmailMock).toHaveBeenCalledTimes(1);

    const call = sendHtmlEmailMock.mock.calls[0][0];
    expect(call.to).toBe('camille@example.fr');
    expect(call.subject).toContain('LOL-123');
    expect(call.subject).not.toContain('{{orderNumber}}');
    expect(call.from).toContain('contact.lolett@gmail.com');
    expect(call.html).toContain('Camille');
    expect(result).toEqual({ success: true });
  });

  it('falls back to hardcoded subject when email_settings is null', async () => {
    getEmailSettingsMock.mockResolvedValueOnce(null);

    await sendOrderCancelled({
      to: 'camille@example.fr',
      firstName: 'Camille',
      orderNumber: 'LOL-999',
    });

    const call = sendHtmlEmailMock.mock.calls[0][0];
    expect(call.subject).toContain('LOL-999');
    expect(call.from).toContain('onboarding@resend.dev');
  });

  it('uses the wasPaid flag to mention refund in the HTML', async () => {
    getEmailSettingsMock.mockResolvedValueOnce(MOCK_SETTINGS);

    await sendOrderCancelled({
      to: 'c@x.fr',
      firstName: 'Camille',
      orderNumber: 'LOL-42',
      wasPaid: true,
    });

    const call = sendHtmlEmailMock.mock.calls[0][0];
    expect(call.html).toMatch(/remboursement/i);
  });

  it('does not throw when getEmailSettings rejects', async () => {
    getEmailSettingsMock.mockRejectedValueOnce(new Error('DB down'));

    const result = await sendOrderCancelled({
      to: 'c@x.fr',
      firstName: 'Camille',
      orderNumber: 'LOL-1',
    });

    expect(result).toEqual({ success: true });
    expect(sendHtmlEmailMock).toHaveBeenCalled();
  });
});
