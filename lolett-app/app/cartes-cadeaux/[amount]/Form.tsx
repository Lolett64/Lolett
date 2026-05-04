'use client';

import { useState, type FormEvent } from 'react';
import { GOLD, BROWN, WARM_CREAM } from '@/components/sections/notre-histoire/constants';

interface GiftCardFormProps {
  amount: 25 | 50 | 100 | 150;
}

const MESSAGE_MAX = 500;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-montserrat), sans-serif',
  fontSize: 12,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'rgba(26,21,16,0.65)',
  marginBottom: 8,
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#fff',
  border: '1px solid rgba(26,21,16,0.15)',
  borderRadius: 10,
  padding: '14px 16px',
  fontFamily: 'var(--font-montserrat), sans-serif',
  fontSize: 15,
  color: BROWN,
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-newsreader), serif',
  fontSize: 'clamp(1.15rem, 2vw, 1.35rem)',
  fontWeight: 500,
  color: BROWN,
  marginBottom: 20,
};

export function GiftCardForm({ amount }: GiftCardFormProps) {
  const [purchaserName, setPurchaserName] = useState('');
  const [purchaserEmail, setPurchaserEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!EMAIL_RE.test(purchaserEmail.trim())) {
      setError('Merci de renseigner ton email.');
      return;
    }
    if (!EMAIL_RE.test(recipientEmail.trim())) {
      setError('Merci de renseigner l’email du destinataire.');
      return;
    }
    if (message.length > MESSAGE_MAX) {
      setError(`Le message ne doit pas dépasser ${MESSAGE_MAX} caractères.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/gift-cards/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          purchaserEmail: purchaserEmail.trim(),
          purchaserName: purchaserName.trim() || undefined,
          recipientEmail: recipientEmail.trim(),
          recipientName: recipientName.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error || 'Une erreur est survenue. Merci de réessayer.');
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError('Impossible de contacter le serveur. Vérifie ta connexion et réessaie.');
      setLoading(false);
    }
  };

  return (
    <section
      style={{
        padding: '0 24px clamp(64px, 8vw, 120px)',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 40,
        }}
        className="gift-form-grid"
      >
        <form onSubmit={handleSubmit} noValidate>
          {/* DE TA PART */}
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 'clamp(24px, 3vw, 36px)',
              marginBottom: 20,
              border: '1px solid rgba(26,21,16,0.08)',
            }}
          >
            <h2 style={sectionTitleStyle}>De ta part</h2>
            <div style={{ marginBottom: 20 }}>
              <label htmlFor="purchaserName" style={labelStyle}>
                Ton prénom <span style={{ textTransform: 'none', opacity: 0.5 }}>(optionnel)</span>
              </label>
              <input
                id="purchaserName"
                type="text"
                value={purchaserName}
                onChange={(e) => setPurchaserName(e.target.value)}
                style={inputStyle}
                autoComplete="given-name"
                maxLength={80}
              />
            </div>
            <div>
              <label htmlFor="purchaserEmail" style={labelStyle}>
                Ton email *
              </label>
              <input
                id="purchaserEmail"
                type="email"
                required
                value={purchaserEmail}
                onChange={(e) => setPurchaserEmail(e.target.value)}
                style={inputStyle}
                autoComplete="email"
              />
            </div>
          </div>

          {/* POUR QUI */}
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 'clamp(24px, 3vw, 36px)',
              marginBottom: 20,
              border: '1px solid rgba(26,21,16,0.08)',
            }}
          >
            <h2 style={sectionTitleStyle}>Pour qui</h2>
            <div style={{ marginBottom: 20 }}>
              <label htmlFor="recipientName" style={labelStyle}>
                Prénom du destinataire{' '}
                <span style={{ textTransform: 'none', opacity: 0.5 }}>(optionnel)</span>
              </label>
              <input
                id="recipientName"
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                style={inputStyle}
                maxLength={80}
              />
            </div>
            <div>
              <label htmlFor="recipientEmail" style={labelStyle}>
                Email du destinataire *
              </label>
              <input
                id="recipientEmail"
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                style={inputStyle}
              />
              <p
                style={{
                  fontFamily: 'var(--font-montserrat), sans-serif',
                  fontSize: 12,
                  color: 'rgba(26,21,16,0.55)',
                  marginTop: 8,
                }}
              >
                C’est à cette adresse que le code cadeau sera envoyé.
              </p>
            </div>
          </div>

          {/* MESSAGE */}
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 'clamp(24px, 3vw, 36px)',
              marginBottom: 20,
              border: '1px solid rgba(26,21,16,0.08)',
            }}
          >
            <h2 style={sectionTitleStyle}>Ton message</h2>
            <label htmlFor="message" style={labelStyle}>
              Petit mot <span style={{ textTransform: 'none', opacity: 0.5 }}>(optionnel)</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
              rows={5}
              maxLength={MESSAGE_MAX}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: 120,
                fontFamily: 'var(--font-montserrat), sans-serif',
              }}
              placeholder="Joyeux anniversaire, j’espère que ça te plaira…"
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                fontFamily: 'var(--font-montserrat), sans-serif',
                fontSize: 12,
                color: 'rgba(26,21,16,0.5)',
                marginTop: 8,
              }}
            >
              {message.length} / {MESSAGE_MAX}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                background: '#fdecec',
                border: '1px solid #e4a4a4',
                color: '#8a2b2b',
                borderRadius: 10,
                padding: '12px 16px',
                fontFamily: 'var(--font-montserrat), sans-serif',
                fontSize: 14,
                marginBottom: 20,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: GOLD,
              color: '#fff',
              border: 'none',
              borderRadius: 40,
              padding: '16px 36px',
              fontFamily: 'var(--font-montserrat), sans-serif',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.2s ease, transform 0.2s ease',
              width: '100%',
            }}
            className="gift-form-cta"
          >
            {loading ? 'Redirection…' : 'Procéder au paiement'}
          </button>
          <p
            style={{
              fontFamily: 'var(--font-montserrat), sans-serif',
              fontSize: 12,
              color: 'rgba(26,21,16,0.5)',
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            Paiement sécurisé par Stripe. Tu seras redirigé(e) vers la page de paiement.
          </p>
        </form>

        {/* RECAP */}
        <aside className="gift-form-recap">
          <div
            style={{
              background: WARM_CREAM,
              border: `1px solid ${GOLD}33`,
              borderRadius: 16,
              padding: 'clamp(24px, 3vw, 32px)',
              position: 'sticky',
              top: 96,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-montserrat), sans-serif',
                fontSize: 12,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: GOLD,
                marginBottom: 16,
              }}
            >
              Récapitulatif
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                paddingBottom: 16,
                borderBottom: '1px solid rgba(26,21,16,0.1)',
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-montserrat), sans-serif',
                  fontSize: 14,
                  color: 'rgba(26,21,16,0.75)',
                }}
              >
                Carte cadeau
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-newsreader), serif',
                  fontSize: 20,
                  color: BROWN,
                }}
              >
                {amount} €
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-montserrat), sans-serif',
                  fontSize: 13,
                  color: 'rgba(26,21,16,0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Total TTC
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-newsreader), serif',
                  fontSize: 'clamp(1.8rem, 3vw, 2.2rem)',
                  color: GOLD,
                }}
              >
                {amount} €
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-newsreader), serif',
                fontStyle: 'italic',
                fontSize: 13,
                color: 'rgba(26,21,16,0.6)',
                lineHeight: 1.6,
              }}
            >
              Valable 1 an à compter de l’achat, sur toute la boutique lolettshop.com.
            </p>
          </div>
        </aside>
      </div>

      <style>{`
        .gift-form-cta:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        @media (min-width: 900px) {
          .gift-form-grid {
            grid-template-columns: minmax(0, 1.5fr) minmax(260px, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
