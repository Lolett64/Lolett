'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Search, UserX, Users } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  consent_at: string;
  source: string;
  unsubscribed_at: string | null;
}

interface ListResponse {
  subscribers: Subscriber[];
  total: number;
  page: number;
  pageSize: number;
}

type StatusFilter = 'all' | 'active' | 'unsubscribed';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function NewsletterSubscribersView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unsubscribing, setUnsubscribing] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), status });
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await fetch(`/api/admin/newsletter/subscribers?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ListResponse = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les inscrits');
    } finally {
      setLoading(false);
    }
  }, [page, status, debouncedSearch]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const handleUnsubscribe = async (sub: Subscriber) => {
    if (!confirm(`Désinscrire ${sub.email} ?`)) return;
    setUnsubscribing(sub.id);
    try {
      const res = await fetch('/api/admin/newsletter/subscribers/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sub.id }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchList();
    } catch (err) {
      console.error(err);
      alert('Échec de la désinscription');
    } finally {
      setUnsubscribing(null);
    }
  };

  const totalPages = useMemo(() => {
    if (!data || data.total === 0) return 1;
    return Math.ceil(data.total / data.pageSize);
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-newsreader)] text-2xl font-light text-[#1a1510]">
            Inscrits à la newsletter
          </h2>
          <p className="mt-1 text-sm text-[#B89547]">
            {data ? `${data.total} inscrit${data.total > 1 ? 's' : ''}` : 'Chargement...'}
          </p>
        </div>

        <a
          href="/api/admin/newsletter/export"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1B0B94] px-4 py-2 text-sm font-medium text-white hover:bg-[#130866] transition-colors"
        >
          <Download className="size-4" />
          Exporter CSV
        </a>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#1a1510]/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par email"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-[#B89547] focus:outline-none focus:ring-1 focus:ring-[#B89547]"
          />
        </div>

        <div className="flex gap-1 rounded-lg bg-white border border-gray-200 p-1">
          {(['all', 'active', 'unsubscribed'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                status === value
                  ? 'bg-[#1B0B94] text-white'
                  : 'text-[#1a1510]/60 hover:text-[#1a1510]'
              }`}
            >
              {value === 'all' ? 'Tous' : value === 'active' ? 'Actifs' : 'Désinscrits'}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-hidden rounded-xl border border-gray-200/50 bg-white">
        {loading ? (
          <div className="p-12 text-center text-sm text-[#1a1510]/40">Chargement...</div>
        ) : error ? (
          <div className="p-12 text-center text-sm text-red-600">{error}</div>
        ) : !data || data.subscribers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto size-10 text-[#1a1510]/20 mb-3" />
            <p className="text-sm text-[#1a1510]/40">Aucun inscrit pour ces filtres</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FDF5E6] text-left text-xs uppercase tracking-wider text-[#1a1510]/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Inscription</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#FDF5E6]/40">
                    <td className="px-4 py-3 text-[#1a1510]">{sub.email}</td>
                    <td className="px-4 py-3 text-[#1a1510]/60">{formatDate(sub.consent_at)}</td>
                    <td className="px-4 py-3 text-[#1a1510]/60">{sub.source}</td>
                    <td className="px-4 py-3">
                      {sub.unsubscribed_at ? (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          Désinscrit le {formatDate(sub.unsubscribed_at)}
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!sub.unsubscribed_at && (
                        <button
                          type="button"
                          onClick={() => handleUnsubscribe(sub)}
                          disabled={unsubscribing === sub.id}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs text-[#1a1510]/70 hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                        >
                          <UserX className="size-3.5" />
                          Désinscrire
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#1a1510]/50">
            Page {data.page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
