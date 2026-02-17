import { Resend } from 'resend';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.NODE_ENV === 'production'
    ? 'LOLETT <contact@lolett.fr>'
    : 'LOLETT <onboarding@resend.dev>';

export async function sendEmail(options: {
  to: string;
  subject: string;
  react: React.ReactElement;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      react: options.react,
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Unexpected error:', message);
    return { success: false, error: message };
  }
}
