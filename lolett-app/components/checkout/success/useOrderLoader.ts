'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Order } from '@/types';

export function useOrderLoader() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const sessionId = searchParams.get('session_id');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderId || !!sessionId);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        let resolvedOrderId = orderId;

        // If coming from Stripe, resolve session_id -> orderId
        // The session endpoint creates the order inline if needed (no polling)
        if (!resolvedOrderId && sessionId) {
          const sessionRes = await fetch(`/api/checkout/stripe/session?session_id=${sessionId}`);
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            resolvedOrderId = sessionData.orderId;
          }
        }

        if (!resolvedOrderId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/orders/${resolvedOrderId}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setOrder(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (orderId || sessionId) {
      loadOrder();
    }
  }, [orderId, sessionId]);

  return { order, loading, error, orderId };
}
