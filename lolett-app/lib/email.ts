import React from 'react';
import { sendReactEmail } from './email-provider';

export async function sendEmail(options: {
  to: string;
  subject: string;
  react: React.ReactElement;
}): Promise<{ success: boolean; error?: string }> {
  return sendReactEmail({
    to: options.to,
    subject: options.subject,
    react: options.react,
  });
}
