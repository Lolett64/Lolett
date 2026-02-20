export const PAYMENT_CONFIG = {
  isStripeEnabled: !!process.env.STRIPE_SECRET_KEY,
  isPaypalEnabled: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  isDemoMode: !process.env.STRIPE_SECRET_KEY && !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
} as const;
