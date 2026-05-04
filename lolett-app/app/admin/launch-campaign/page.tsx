'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Send, Trash2, RotateCw, Eye, Upload } from 'lucide-react';

interface Contact {
  id: string;
  email: string;
  first_name: string;
  promo_code: string;
  email_status: 'pending' | 'sent' | 'failed';
  email_sent_at: string | null;
  email_error: string | null;
  created_at: string;
}

type Busy =
  | { kind: 'none' }
  | { kind: 'import' }
  | { kind: 'send'; scope: 'pending' | 'retry' }
  | { kind: 'send-one'; id: string }
  | { kind: 'delete'; id: string }
  | { kind: 'reset' };

export default function LaunchCampaignPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [csv, setCsv] = useState('');
  const [discount, setDiscount] = useState(15);
  const [busy, setBusy] = useState<Busy>({ kind: 'none' });
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/launch-campaign');
      if (res.ok) setContacts(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    return {
      total: contacts.length,
      pending: contacts.filter((c) => c.email_status === 'pending').length,
      sent: contacts.filter((c) => c.email_status === 'sent').length,
      failed: contacts.filter((c) => c.email_status === 'failed').length,
    };
  }, [contacts]);

  async function handleImport() {
    if (!csv.trim()) return;
    setBusy({ kind: 'import' });
    setFlash(null);
    try {
      const res = await fetch('/api/admin/launch-campaign/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv, discountPercent: discount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFlash(data.error || 'Import échoué');
      } else {
        const parts = [`${data.imported} importés`];
        if (data.skipped) parts.push(`${data.skipped} déjà présents`);
        if (data.errors?.length) parts.push(`${data.errors.length} erreurs`);
        setFlash(parts.join(' · '));
        setCsv('');
        await load();
      }
    } finally {
      setBusy({ kind: 'none' });
    }
  }

  async function handleSend(scope: 'pending' | 'retry') {
    const label = scope === 'pending' ? stats.pending : stats.pending + stats.failed;
    if (label === 0) return;
    if (!confirm(`Envoyer l'email à ${label} contact${label > 1 ? 's' : ''} ?`)) return;
    setBusy({ kind: 'send', scope });
    setFlash(null);
    try {
      const res = await fetch('/api/admin/launch-campaign/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scope === 'retry' ? { retryFailed: true } : {}),
      });
      const data = await res.json();
      if (!res.ok) {
        setFlash(data.error || 'Envoi échoué');
      } else {
        setFlash(`${data.sent} envoyés · ${data.failed} échecs (sur ${data.total})`);
        await load();
      }
    } finally {
      setBusy({ kind: 'none' });
    }
  }

  async function handleSendOne(id: string) {
    setBusy({ kind: 'send-one', id });
    try {
      await fetch('/api/admin/launch-campaign/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onlyContactId: id }),
      });
      await load();
    } finally {
      setBusy({ kind: 'none' });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce contact et son code promo ?')) return;
    setBusy({ kind: 'delete', id });
    try {
      await fetch(`/api/admin/launch-campaign?id=${id}`, { method: 'DELETE' });
      await load();
    } finally {
      setBusy({ kind: 'none' });
    }
  }

  async function handleReset() {
    if (!confirm('Supprimer TOUS les contacts et leurs codes promo ?')) return;
    setBusy({ kind: 'reset' });
    try {
      await fetch('/api/admin/launch-campaign?all=true', { method: 'DELETE' });
      await load();
    } finally {
      setBusy({ kind: 'none' });
    }
  }

  const previewHref = `/api/admin/launch-campaign/preview?discount=${discount}`;
  const isSendingBatch = busy.kind === 'send';

  return (
    <div className="max-w-[980px] mx-auto space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-newsreader)] text-3xl font-light text-[#1a1510]">
          Campagne d&apos;ouverture
        </h1>
        <p className="text-sm text-[#8b7e74] mt-1">
          Importe ta liste de contacts pré-lancement, puis envoie à chacun un email personnalisé avec un code promo unique.
        </p>
      </div>

      <section className="bg-white rounded-xl border border-[#e8e0d6] p-6 space-y-4">
        <h2 className="text-lg font-medium text-[#2c2420]">1 · Importer les contacts</h2>
        <p className="text-sm text-[#8b7e74]">
          Colle le CSV ci-dessous. Format&nbsp;: <code className="bg-[#faf6f0] px-1.5 py-0.5 rounded">Prénom,Email</code> (séparateur&nbsp;: virgule, point-virgule ou tabulation). L&apos;en-tête est optionnel.
        </p>

        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder={`Prénom,Email\nMarie,marie@exemple.fr\nJean-Louis,jl@exemple.fr`}
          rows={8}
          className="w-full border border-[#e8e0d6] rounded-lg px-3 py-2 text-sm font-mono bg-[#faf6f0] focus:outline-none focus:border-[#C4956A]"
        />

        <div className="flex items-end gap-4 flex-wrap">
          <label className="text-sm">
            <span className="block text-[#8b7e74] mb-1">Remise (%)</span>
            <input
              type="number"
              min={5}
              max={50}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-24 border border-[#e8e0d6] rounded-md px-3 py-2 bg-white"
            />
          </label>
          <button
            type="button"
            onClick={handleImport}
            disabled={!csv.trim() || busy.kind !== 'none'}
            className="bg-[#1B0B94] hover:bg-[#160977] disabled:opacity-60 text-white rounded-lg px-5 py-2 text-sm font-medium flex items-center gap-2"
          >
            {busy.kind === 'import' ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Import en cours…
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Importer
              </>
            )}
          </button>
          <a
            href={previewHref}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[#C4956A] hover:underline flex items-center gap-1.5"
          >
            <Eye className="size-4" />
            Prévisualiser l&apos;email
          </a>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-[#e8e0d6] p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-medium text-[#2c2420]">2 · Contacts et envoi</h2>
          <div className="flex gap-4 text-sm">
            <Stat label="Total" value={stats.total} />
            <Stat label="En attente" value={stats.pending} color="text-amber-700" />
            <Stat label="Envoyés" value={stats.sent} color="text-green-700" />
            <Stat label="Échoués" value={stats.failed} color="text-red-700" />
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => handleSend('pending')}
            disabled={stats.pending === 0 || busy.kind !== 'none'}
            className="bg-[#C4956A] hover:bg-[#b3845c] disabled:opacity-40 text-white rounded-lg px-5 py-2 text-sm font-medium flex items-center gap-2"
          >
            {isSendingBatch && busy.scope === 'pending' ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Envoi en cours…
              </>
            ) : (
              <>
                <Send className="size-4" />
                Lancer la campagne ({stats.pending})
              </>
            )}
          </button>
          {stats.failed > 0 && (
            <button
              type="button"
              onClick={() => handleSend('retry')}
              disabled={busy.kind !== 'none'}
              className="bg-white hover:bg-[#faf6f0] border border-[#e8e0d6] text-[#2c2420] rounded-lg px-5 py-2 text-sm font-medium flex items-center gap-2"
            >
              {isSendingBatch && busy.scope === 'retry' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RotateCw className="size-4" />
              )}
              Réessayer les échecs ({stats.failed})
            </button>
          )}
          {stats.total > 0 && (
            <button
              type="button"
              onClick={handleReset}
              disabled={busy.kind !== 'none'}
              className="ml-auto text-red-600 hover:bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2"
            >
              <Trash2 className="size-4" />
              Tout effacer
            </button>
          )}
        </div>

        {flash && (
          <div className="rounded-md bg-[#faf6f0] border border-[#e8e0d6] px-3 py-2 text-sm text-[#2c2420]">
            {flash}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-5 animate-spin text-[#1B0B94]" />
          </div>
        ) : contacts.length === 0 ? (
          <p className="text-sm text-[#8b7e74] text-center py-8">
            Aucun contact importé pour l&apos;instant.
          </p>
        ) : (
          <div className="border border-[#e8e0d6] rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#faf6f0] text-left text-[#8b7e74]">
                <tr>
                  <th className="px-4 py-2">Prénom</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Code promo</th>
                  <th className="px-4 py-2 w-24">Statut</th>
                  <th className="px-4 py-2 w-40">Envoyé le</th>
                  <th className="px-4 py-2 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-t border-[#e8e0d6]">
                    <td className="px-4 py-2">{c.first_name}</td>
                    <td className="px-4 py-2 text-[#5a5048]">{c.email}</td>
                    <td className="px-4 py-2 font-mono text-xs text-[#C4956A]">{c.promo_code}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={c.email_status} error={c.email_error} />
                    </td>
                    <td className="px-4 py-2 text-xs text-[#8b7e74]">
                      {c.email_sent_at ? new Date(c.email_sent_at).toLocaleString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex gap-1 justify-end">
                        {c.email_status !== 'sent' && (
                          <button
                            type="button"
                            onClick={() => handleSendOne(c.id)}
                            disabled={busy.kind !== 'none'}
                            className="p-1.5 rounded hover:bg-[#faf6f0] text-[#C4956A] disabled:opacity-30"
                            title="Envoyer à ce contact"
                          >
                            {busy.kind === 'send-one' && busy.id === c.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Send className="size-4" />
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          disabled={busy.kind !== 'none'}
                          className="p-1.5 rounded hover:bg-red-50 text-red-600 disabled:opacity-30"
                          title="Supprimer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="text-right">
      <p className="text-xs text-[#8b7e74] uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-medium ${color ?? 'text-[#2c2420]'}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status, error }: { status: Contact['email_status']; error: string | null }) {
  if (status === 'sent') {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">Envoyé</span>;
  }
  if (status === 'failed') {
    return (
      <span
        title={error ?? undefined}
        className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 cursor-help"
      >
        Échec
      </span>
    );
  }
  return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">En attente</span>;
}
