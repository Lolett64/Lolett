'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check, ChevronDown } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const faqs = [
  {
    q: 'Quels sont les délais de livraison ?',
    a: 'La livraison standard en France métropolitaine est de 3 à 5 jours ouvrés. Gratuite dès 100€ d\'achat.',
  },
  {
    q: 'Comment faire un retour ou un échange ?',
    a: 'Tu as 14 jours pour retourner un article. Il te suffit de nous contacter par email et on t\'envoie une étiquette retour.',
  },
  {
    q: 'Les tailles correspondent-elles ?',
    a: 'Nos coupes sont pensées pour tomber juste. Un guide des tailles est disponible sur chaque fiche produit.',
  },
  {
    q: 'Où sont fabriqués vos vêtements ?',
    a: 'Nous travaillons avec des ateliers en Europe (Portugal, Italie) sélectionnés pour leur savoir-faire et leurs conditions de travail.',
  },
];

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'hello@lolett.com', href: 'mailto:hello@lolett.com' },
  { icon: Phone, label: 'Téléphone', value: '+33 6 00 00 00 00', href: 'tel:+33600000000' },
  { icon: MapPin, label: 'Adresse', value: 'Quelque part dans le Sud, là où le soleil brille', href: undefined },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 text-base font-medium text-white">{q}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-[#1B0B94] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}
      >
        <p className="text-sm leading-relaxed text-white/60">{a}</p>
      </div>
    </div>
  );
}

export function ContactPageV2() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Silently handle - could add error state later
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0f0d0a] text-white">

      {/* ══ HERO ══ */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#1B0B94]/20 to-transparent" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-[#1B0B94]">
            Contact
          </p>
          <h1 className="font-display mt-6 text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
            On est là pour toi
          </h1>
          <p className="mx-auto mt-6 max-w-[48ch] text-lg leading-relaxed text-white/60">
            Une question, une suggestion, un souci de commande ? Écris-nous, on répond sous 24-48h.
          </p>
        </div>
      </section>

      {/* ══ FORM + INFO ══ */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_400px] lg:gap-20">

            {/* Formulaire */}
            <ScrollReveal>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-10">
                {submitted ? (
                  <div className="py-16 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#1B0B94]">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="font-display text-2xl font-bold">Message envoyé !</h2>
                    <p className="mt-3 text-white/60">
                      On te répond très vite. Merci de nous avoir contactés.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-white/80">Nom</label>
                        <input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 transition-colors focus:border-[#1B0B94] focus:outline-none"
                          placeholder="Ton nom"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-white/80">Email</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 transition-colors focus:border-[#1B0B94] focus:outline-none"
                          placeholder="ton@email.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-white/80">Sujet</label>
                      <input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 transition-colors focus:border-[#1B0B94] focus:outline-none"
                        placeholder="De quoi s'agit-il ?"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-white/80">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 transition-colors focus:border-[#1B0B94] focus:outline-none"
                        placeholder="Dis-nous tout..."
                      />
                    </div>

                    {/* Honeypot */}
                    <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1B0B94] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#130970] disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {sending ? 'Envoi en cours...' : 'Envoyer le message'}
                    </button>
                  </form>
                )}
              </div>
            </ScrollReveal>

            {/* Infos + carte */}
            <div className="space-y-10">
              <ScrollReveal variant="right">
                <div className="space-y-6">
                  <h2 className="font-display text-xl font-semibold">Nos coordonnées</h2>
                  {contactInfo.map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#1B0B94]/10">
                        <item.icon className="h-5 w-5 text-[#1B0B94]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/80">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="text-sm text-white/50 transition-colors hover:text-[#1B0B94]">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm text-white/50">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal variant="right">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-sm font-medium text-white/80">Délais de réponse</p>
                  <p className="mt-1.5 text-sm text-white/50">
                    On répond généralement sous 24-48h. Promis, on fait au plus vite.
                  </p>
                </div>
              </ScrollReveal>

              {/* Mini carte statique */}
              <ScrollReveal variant="right">
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <div className="relative aspect-[4/3] bg-[#1a1510]">
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <MapPin className="mx-auto h-8 w-8 text-[#1B0B94]" />
                        <p className="mt-3 font-display text-lg font-semibold">Sud de la France</p>
                        <p className="mt-1 text-sm text-white/40">Là où le soleil brille</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="border-t border-white/10 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <p className="text-xs font-medium tracking-[0.25em] uppercase text-[#1B0B94]">
                FAQ
              </p>
              <h2 className="font-display mt-4 text-3xl font-bold sm:text-4xl">
                Questions fréquentes
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="divide-y divide-white/0">
              {faqs.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
