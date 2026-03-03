'use client';

import { Suspense } from 'react';
import { SuccessContent } from '@/components/checkout/success/SuccessContent';

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', paddingTop: 96, paddingBottom: 80 }}>
          <p style={{ color: '#9B8E82', animation: 'pulse 1.5s infinite' }}>Chargement...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
