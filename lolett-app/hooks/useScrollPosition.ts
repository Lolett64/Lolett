'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook performant pour tracker la position de scroll.
 * Utilise requestAnimationFrame pour throttler les updates.
 */
export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);

  const updateScrollY = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollY();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Trigger initial read via rAF (not synchronously in effect)
    window.requestAnimationFrame(updateScrollY);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateScrollY]);

  return scrollY;
}
