'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Save, Send, Clock, Loader2, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { HistoryDrawer } from '@/components/admin/HistoryDrawer';

interface EmailSettings {
  id: string;
  template_key: string;
  label: string;
  from_name: string;
  from_email: string;
  subject_template: string;
  greeting: string;
  body_text: string;
  cta_text: string;
  cta_url: string;
  signoff: string;
  extra_params: Record<string, unknown>;
  updated_at?: string;
}

type FormData = Omit<EmailSettings, 'id' | 'template_key' | 'label' | 'updated_at'>;

const VARIABLES_BY_TEMPLATE: Record<string, string[]> = {
  order_confirmation: ['{firstName}', '{orderNumber}', '{total}'],
  welcome_newsletter: ['{firstName}', '{promoCode}'],
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} à ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminEmailsPage() {
  const [emails, setEmails] = useState<EmailSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testModal, setTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = emails.find((e) => e.id === selectedId) ?? null;

  // ---------- Fetch list ----------
  const fetchEmails = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/emails');
      const data = await res.json();
      setEmails(data.emails ?? []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // ---------- Select a template ----------
  const selectTemplate = (email: EmailSettings) => {
    setSelectedId(email.id);
    const fd: FormData = {
      from_name: email.from_name,
      from_email: email.from_email,
      subject_template: email.subject_template,
      greeting: email.greeting,
      body_text: email.body_text,
      cta_text: email.cta_text,
      cta_url: email.cta_url,
      signoff: email.signoff,
      extra_params: email.extra_params ?? {},
    };
    setFormData(fd);
    setOriginalData(fd);
    setPreviewHtml('');
    setSavedFlash(false);
    fetchPreview(email.template_key, fd);
  };

  // ---------- Preview ----------
  const fetchPreview = async (templateKey: string, overrides: FormData) => {
    setPreviewLoading(true);
    try {
      const res = await fetch('/api/admin/emails/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_key: templateKey, overrides }),
      });
      const data = await res.json();
      setPreviewHtml(data.html ?? '');
    } catch {
      setPreviewHtml('<p style="color:red;padding:1rem;">Erreur de prévisualisation</p>');
    } finally {
      setPreviewLoading(false);
    }
  };

  const schedulePreview = (fd: FormData) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (selected) fetchPreview(selected.template_key, fd);
    }, 800);
  };

  // ---------- Form helpers ----------
  const updateField = (key: keyof FormData, value: string) => {
    if (!formData) return;
    const next = { ...formData, [key]: value };
    setFormData(next);
    schedulePreview(next);
  };

  const updateExtraParam = (key: string, value: string | number) => {
    if (!formData) return;
    const next = { ...formData, extra_params: { ...formData.extra_params, [key]: value } };
    setFormData(next);
    schedulePreview(next);
  };

  const isDirty = formData && originalData && JSON.stringify(formData) !== JSON.stringify(originalData);

  // ---------- Save ----------
  const handleSave = async () => {
    if (!selectedId || !formData) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/emails/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updated = await res.json();
        setEmails((prev) => prev.map((e) => (e.id === selectedId ? { ...e, ...updated } : e)));
        setOriginalData({ ...formData });
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2000);
      }
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  // ---------- Test email ----------
  const handleSendTest = async () => {
    if (!selected || !testEmail) return;
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/emails/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_key: selected.template_key, recipient: testEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ ok: true, msg: 'Email envoyé ✓' });
        setTimeout(() => {
          setTestModal(false);
          setTestResult(null);
        }, 1500);
      } else {
        setTestResult({ ok: false, msg: data.error || 'Erreur' });
      }
    } catch {
      setTestResult({ ok: false, msg: 'Erreur réseau' });
    } finally {
      setSendingTest(false);
    }
  };

  // ---------- LIST VIEW ----------
  if (!selectedId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-gray-900">Emails transactionnels</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez le contenu de vos emails automatiques</p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-xl bg-white border border-gray-200" />
            ))}
          </div>
        ) : emails.length === 0 ? (
          <div className="rounded-xl bg-white border border-gray-200 p-12 text-center">
            <Mail className="mx-auto size-10 text-gray-300 mb-3" />
            <p className="text-gray-500">Aucun template email configuré</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => selectTemplate(email)}
                className="text-left rounded-xl bg-white border border-gray-200 shadow-sm p-5 hover:border-[#2418a6]/40 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-[#2418a6]/10 text-[#2418a6]">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-[#2418a6] transition-colors">
                        {email.label}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">{email.subject_template}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                  <span>De : {email.from_name}</span>
                  {email.updated_at && <span>Mis à jour le {formatDate(email.updated_at)}</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---------- EDIT VIEW ----------
  if (!formData || !selected) return null;

  const variables = VARIABLES_BY_TEMPLATE[selected.template_key] ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setSelectedId(null);
            setFormData(null);
          }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#2418a6] transition-colors"
        >
          <ArrowLeft className="size-4" />
          Retour aux emails
        </button>

        <div className="flex items-center gap-2">
          {savedFlash && (
            <span className="text-sm text-green-600 font-medium animate-fade-in">Sauvegardé ✓</span>
          )}
          {isDirty && !savedFlash && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              Modifié
            </span>
          )}
        </div>
      </div>

      <div>
        <h1 className="font-display text-2xl font-semibold text-gray-900">{selected.label}</h1>
        <p className="text-sm text-gray-500 mt-1">Template : {selected.template_key}</p>
      </div>

      {/* Two-column layout */}
      <div className="lg:grid lg:grid-cols-2 gap-6">
        {/* LEFT — Form */}
        <div className="space-y-4">
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 space-y-4">
            <Field label="Nom expéditeur" value={formData.from_name} onChange={(v) => updateField('from_name', v)} />
            <Field label="Email expéditeur" value={formData.from_email} onChange={(v) => updateField('from_email', v)} />
            <Field
              label="Sujet"
              value={formData.subject_template}
              onChange={(v) => updateField('subject_template', v)}
              hint="Variables : {orderNumber}, {firstName}"
            />
            <Field label="Salutation" value={formData.greeting} onChange={(v) => updateField('greeting', v)} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texte principal</label>
              <textarea
                value={formData.body_text}
                onChange={(e) => updateField('body_text', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2418a6] focus:ring-1 focus:ring-[#2418a6] outline-none transition-colors"
              />
            </div>
            <Field label="Texte du bouton" value={formData.cta_text} onChange={(v) => updateField('cta_text', v)} />
            <Field label="URL du bouton" value={formData.cta_url} onChange={(v) => updateField('cta_url', v)} />
            <Field label="Signature" value={formData.signoff} onChange={(v) => updateField('signoff', v)} />

            {/* Extra params for welcome_newsletter */}
            {selected.template_key === 'welcome_newsletter' && (
              <div className="space-y-3 border-t pt-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Paramètres bonus</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Réduction (%)</label>
                  <Input
                    type="number"
                    value={(formData.extra_params?.discount_percent as number) ?? ''}
                    onChange={(e) => updateExtraParam('discount_percent', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée promo (jours)</label>
                  <Input
                    type="number"
                    value={(formData.extra_params?.promo_duration_days as number) ?? ''}
                    onChange={(e) => updateExtraParam('promo_duration_days', Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Variables hint */}
          {variables.length > 0 && (
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
              <p className="text-xs font-medium text-blue-700 mb-1">Variables disponibles</p>
              <div className="flex flex-wrap gap-1.5">
                {variables.map((v) => (
                  <code key={v} className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800">
                    {v}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="flex items-center gap-2 rounded-lg bg-[#2418a6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1c1385] disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Enregistrer
            </button>
            <button
              onClick={() => {
                setTestModal(true);
                setTestEmail('');
                setTestResult(null);
              }}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Send className="size-4" />
              Envoyer un test
            </button>
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              title="Historique"
            >
              <Clock className="size-4" />
            </button>
          </div>
        </div>

        {/* RIGHT — Preview */}
        <div className="mt-6 lg:mt-0">
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-medium text-gray-700">Aperçu</p>
            </div>
            <div className="relative" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {previewLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="size-4 animate-spin" />
                    Chargement...
                  </div>
                </div>
              )}
              {previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  sandbox=""
                  className="w-full border-0"
                  style={{ minHeight: '500px', height: '65vh' }}
                  title="Aperçu email"
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-sm text-gray-400">
                  Chargement de l&apos;aperçu...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test email modal */}
      {testModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setTestModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-xl bg-white shadow-xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-medium text-gray-900">Envoyer un email de test</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              {testResult && (
                <p className={`text-sm font-medium ${testResult.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {testResult.msg}
                </p>
              )}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setTestModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSendTest}
                  disabled={sendingTest || !testEmail}
                  className="flex items-center gap-2 rounded-lg bg-[#2418a6] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c1385] disabled:opacity-50 transition-colors"
                >
                  {sendingTest ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* History drawer */}
      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        tableName="email_settings"
        recordId={selectedId}
        onRestore={() => {
          fetchEmails();
          if (selected) selectTemplate(selected);
        }}
      />
    </div>
  );
}

// ---------- Field component ----------
function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
