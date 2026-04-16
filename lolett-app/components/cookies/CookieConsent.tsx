'use client';

import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

const COOKIE_NAME = 'lolett-consent';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 an

export interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
}

function getStoredConsent(): CookiePreferences | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

function setConsentCookie(prefs: CookiePreferences) {
  const value = encodeURIComponent(JSON.stringify(prefs));
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/** Émet un custom event pour que les scripts tiers réagissent au consentement */
function dispatchConsentEvent(prefs: CookiePreferences) {
  window.dispatchEvent(new CustomEvent('lolett-consent', { detail: prefs }));
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookiePreferences | null>(null);
  useEffect(() => {
    setConsent(getStoredConsent());
  }, []);
  return consent;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      setVisible(true);
    } else {
      dispatchConsentEvent(stored);
    }
  }, []);

  const accept = useCallback((prefs: CookiePreferences) => {
    setConsentCookie(prefs);
    dispatchConsentEvent(prefs);
    setVisible(false);
  }, []);

  const acceptAll = () => accept({ analytics: true, marketing: true });
  const refuseAll = () => accept({ analytics: false, marketing: false });
  const acceptSelected = () => accept({ analytics, marketing });

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 pointer-events-none">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 pointer-events-auto" />

      {/* Bandeau */}
      <div
        className="relative w-full max-w-[520px] rounded-xl border pointer-events-auto animate-in slide-in-from-bottom-4 duration-500"
        style={{
          background: '#0C0A1E',
          borderColor: 'rgba(184,149,71,0.15)',
        }}
      >
        {/* Bouton fermer */}
        <button
          onClick={refuseAll}
          className="absolute top-3 right-3 p-1.5 rounded-full transition-colors hover:bg-white/10"
          aria-label="Fermer"
        >
          <X size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
        </button>

        <div className="px-6 py-5">
          {/* Titre */}
          <p
            className="text-[10px] tracking-[0.3em] uppercase mb-3"
            style={{ color: '#B89547' }}
          >
            Cookies
          </p>

          <p
            className="text-[13px] leading-relaxed mb-4"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Nous utilisons des cookies pour analyser le trafic et améliorer votre expérience.
            Vous pouvez choisir les cookies que vous acceptez.{' '}
            <a
              href="/confidentialite"
              className="underline transition-colors hover:text-[#B89547]"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              En savoir plus
            </a>
          </p>

          {/* Détails */}
          {showDetails && (
            <div className="mb-4 space-y-2.5">
              {/* Technique — toujours actif */}
              <label className="flex items-center gap-3 cursor-default">
                <input type="checkbox" checked disabled className="accent-[#B89547] w-3.5 h-3.5" />
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Essentiels</strong> — fonctionnement du site (toujours actifs)
                </span>
              </label>

              {/* Analytics */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="accent-[#B89547] w-3.5 h-3.5"
                />
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Analytiques</strong> — mesure d&apos;audience (Google Analytics)
                </span>
              </label>

              {/* Marketing */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="accent-[#B89547] w-3.5 h-3.5"
                />
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Marketing</strong> — publicités ciblées (Meta Pixel)
                </span>
              </label>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-2.5">
            <button
              onClick={acceptAll}
              className="flex-1 rounded-md py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] transition-all hover:shadow-[0_4px_20px_rgba(184,149,71,0.25)] hover:-translate-y-px"
              style={{ background: '#B89547', color: '#0C0A1E' }}
            >
              Tout accepter
            </button>
            <button
              onClick={refuseAll}
              className="flex-1 rounded-md py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] border transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(184,149,71,0.2)', color: 'rgba(255,255,255,0.6)' }}
            >
              Tout refuser
            </button>
            <button
              onClick={() => showDetails ? acceptSelected() : setShowDetails(true)}
              className="flex-1 rounded-md py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] border transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(184,149,71,0.2)', color: '#B89547' }}
            >
              {showDetails ? 'Confirmer' : 'Personnaliser'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
