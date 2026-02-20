'use client';

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'Quels sont les délais de livraison ?', a: 'La livraison standard en France métropolitaine est de 3 à 5 jours ouvrés. Gratuite dès 100\u20AC d\'achat.' },
  { q: 'Comment faire un retour ou un échange ?', a: 'Tu as 14 jours pour retourner un article. Contacte-nous par email et on t\'envoie une étiquette retour.' },
  { q: 'Les tailles correspondent-elles ?', a: 'Nos coupes sont pensées pour tomber juste. Un guide des tailles est disponible sur chaque fiche produit.' },
  { q: 'Où sont fabriqués vos vêtements ?', a: 'Nous travaillons avec des ateliers en Europe (Portugal, Italie) sélectionnés pour leur savoir-faire.' },
];

const defaultContactPills = [
  { icon: '✉', label: 'Email', valueKey: 'email', defaultValue: 'hello@lolett.com', hrefPrefix: 'mailto:' },
  { icon: '☏', label: 'Téléphone', valueKey: 'phone', defaultValue: '+33 6 00 00 00 00', hrefPrefix: 'tel:' },
  { icon: '⌖', label: 'Adresse', valueKey: 'address', defaultValue: 'Sud de la France', hrefPrefix: undefined },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #E8E0D6' }}>
      <button onClick={() => setOpen(!open)} style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#2C2420', fontFamily: "'DM Sans', sans-serif", paddingRight: 16 }}>{q}</span>
        <ChevronDown size={18} color="#C4956A" style={{ flexShrink: 0, transition: 'transform 0.3s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>
      <div style={{ overflow: 'hidden', maxHeight: open ? 160 : 0, transition: 'max-height 0.3s ease', paddingBottom: open ? 16 : 0 }}>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: '#9B8E82', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{a}</p>
      </div>
    </div>
  );
}

interface ContactV1Props {
  content?: Record<string, string>;
}

export function ContactV1({ content }: ContactV1Props) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) setSubmitted(true);
    } catch { /* */ } finally { setSending(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        .cv1-page {
          min-height: 100vh;
          background-color: #FAF7F2;
          padding: 120px 20px 80px;
          font-family: 'DM Sans', sans-serif;
          color: #2C2420;
        }
        .cv1-container {
          max-width: 600px;
          margin: 0 auto;
        }

        /* Floating label */
        .cv1-float-group {
          position: relative;
          margin-bottom: 24px;
        }
        .cv1-float-input, .cv1-float-textarea {
          width: 100%;
          padding: 14px 0 8px 0;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #2C2420;
          background: transparent;
          border: none;
          border-bottom: 1px solid #E8E0D6;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
          resize: none;
        }
        .cv1-float-input:focus, .cv1-float-textarea:focus {
          border-bottom-color: #C4956A;
        }
        .cv1-float-label {
          position: absolute;
          left: 0;
          top: 14px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #9B8E82;
          pointer-events: none;
          transition: all 0.2s ease;
        }
        .cv1-float-input:focus + .cv1-float-label,
        .cv1-float-input:not(:placeholder-shown) + .cv1-float-label,
        .cv1-float-textarea:focus + .cv1-float-label,
        .cv1-float-textarea:not(:placeholder-shown) + .cv1-float-label {
          top: -6px;
          font-size: 10px;
          color: #C4956A;
          font-weight: 500;
          letter-spacing: 0.04em;
        }

        .cv1-card {
          background: #fff;
          border-radius: 12px;
          padding: 36px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .cv1-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 15px 32px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.03em;
          color: #fff;
          background-color: #C4956A;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
          gap: 8px;
        }
        .cv1-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(196,149,106,0.35);
        }
        .cv1-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .cv1-reveal {
          opacity: 0;
          transform: translateY(12px);
          animation: cv1Reveal 0.5s ease forwards;
        }
        @keyframes cv1Reveal {
          to { opacity: 1; transform: translateY(0); }
        }

        .cv1-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          background: #fff;
          border-radius: 50px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .cv1-pill:hover {
          box-shadow: 0 4px 12px rgba(196,149,106,0.15);
          transform: translateY(-1px);
        }
      `}</style>

      <div className="cv1-page">
        <div className="cv1-container">

          {/* Header */}
          <div className="cv1-reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#C4956A', margin: '0 0 16px' }}>Contact</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 500, fontSize: 38, color: '#2C2420', margin: '0 0 12px' }}>
              {content?.title || 'Parlons ensemble.'}
            </h1>
            <p style={{ fontSize: 15, color: '#9B8E82', margin: 0, lineHeight: 1.6 }}>
              {content?.subtitle || 'Une question, une suggestion ? On te répond sous 24-48h.'}
            </p>
          </div>

          {/* Form card */}
          <div className="cv1-reveal" style={{ animationDelay: '100ms' }}>
            <div className="cv1-card">
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#C4956A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Check size={28} color="#fff" />
                  </div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 26, fontWeight: 500, margin: '0 0 8px' }}>Message envoyé !</h2>
                  <p style={{ fontSize: 14, color: '#9B8E82' }}>On te répond très vite. Merci.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                    <div className="cv1-float-group">
                      <input className="cv1-float-input" name="name" value={formData.name} onChange={handleChange} placeholder=" " required />
                      <label className="cv1-float-label">Nom</label>
                    </div>
                    <div className="cv1-float-group">
                      <input className="cv1-float-input" name="email" type="email" value={formData.email} onChange={handleChange} placeholder=" " required />
                      <label className="cv1-float-label">Email</label>
                    </div>
                  </div>
                  <div className="cv1-float-group">
                    <input className="cv1-float-input" name="subject" value={formData.subject} onChange={handleChange} placeholder=" " required />
                    <label className="cv1-float-label">Sujet</label>
                  </div>
                  <div className="cv1-float-group">
                    <textarea className="cv1-float-textarea" name="message" value={formData.message} onChange={handleChange} placeholder=" " required rows={5} />
                    <label className="cv1-float-label">Message</label>
                  </div>
                  <input type="text" name="website" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
                  <button type="submit" className="cv1-btn" disabled={sending}>
                    {sending ? 'Envoi en cours...' : 'Envoyer le message'}
                    {!sending && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact pills */}
          <div className="cv1-reveal" style={{ animationDelay: '200ms', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 24 }}>
            {defaultContactPills.map((p, i) => {
              const value = content?.[p.valueKey] || p.defaultValue;
              const href = p.hrefPrefix ? `${p.hrefPrefix}${value.replace(/\s/g, '')}` : undefined;
              const Tag = href ? 'a' : 'div';
              return (
                <Tag key={i} className="cv1-pill" {...(href ? { href } : {})} style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 12px', textDecoration: 'none' }}>
                  <span style={{ fontSize: 20, marginBottom: 6 }}>{p.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#C4956A', marginBottom: 4 }}>{p.label}</span>
                  <span style={{ fontSize: 12, color: '#7A6E62', lineHeight: 1.4 }}>{value}</span>
                </Tag>
              );
            })}
          </div>

          {/* Flourish */}
          <div className="cv1-reveal" style={{ animationDelay: '300ms', textAlign: 'center', color: '#D4CBC0', fontSize: 14, padding: '40px 0 32px', letterSpacing: 4 }}>
            ——— ✦ ———
          </div>

          {/* FAQ */}
          <div className="cv1-reveal" style={{ animationDelay: '400ms' }}>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#C4956A', textAlign: 'center', margin: '0 0 8px' }}>FAQ</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 500, fontSize: 28, textAlign: 'center', margin: '0 0 28px' }}>Questions fréquentes</h2>
            <div className="cv1-card" style={{ padding: '8px 28px' }}>
              {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
