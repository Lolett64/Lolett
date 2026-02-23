'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, RotateCcw } from 'lucide-react';

interface HistoryEntry {
  id: string;
  table_name: string;
  record_id: string;
  previous_value: Record<string, unknown>;
  changed_by: string | null;
  changed_at: string;
}

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  tableName: 'site_content' | 'email_settings';
  recordId: string;
  onRestore: () => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function previewValue(prev: Record<string, unknown>): string {
  const val = prev.value;
  if (typeof val === 'string') {
    if (val.match(/\.(jpg|jpeg|png|webp|avif|svg)(\?|$)/i)) {
      return `[image]`;
    }
    return val.length > 100 ? val.slice(0, 100) + '...' : val;
  }
  return JSON.stringify(val)?.slice(0, 100) ?? '';
}

function isImageUrl(prev: Record<string, unknown>): string | null {
  const val = prev.value;
  if (typeof val === 'string' && val.match(/\.(jpg|jpeg|png|webp|avif|svg)(\?|$)/i)) {
    return val;
  }
  return null;
}

export function HistoryDrawer({ open, onClose, tableName, recordId, onRestore }: HistoryDrawerProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/history?table=${tableName}&record_id=${recordId}`);
      const data = await res.json();
      setEntries(data.history ?? []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [tableName, recordId]);

  useEffect(() => {
    if (open && recordId) fetchHistory();
  }, [open, recordId, fetchHistory]);

  const handleRestore = async (historyId: string) => {
    setRestoring(historyId);
    try {
      await fetch('/api/admin/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyId }),
      });
      onRestore();
      onClose();
    } catch {
      // silent
    } finally {
      setRestoring(null);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-96 max-w-full bg-white shadow-xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-medium text-gray-900">Historique des modifications</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100">
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Aucun historique</p>
          ) : (
            <div className="space-y-3">
              {entries.map(entry => {
                const imgUrl = isImageUrl(entry.previous_value);
                return (
                  <div key={entry.id} className="rounded-lg border border-gray-200 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{formatDate(entry.changed_at)}</span>
                      {entry.changed_by && (
                        <span className="text-xs text-gray-400">{entry.changed_by}</span>
                      )}
                    </div>

                    {imgUrl ? (
                      <img src={imgUrl} alt="Previous" className="h-16 rounded object-cover" />
                    ) : (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 break-words">
                        {previewValue(entry.previous_value)}
                      </p>
                    )}

                    <button
                      onClick={() => handleRestore(entry.id)}
                      disabled={restoring === entry.id}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#1B0B94] hover:underline disabled:opacity-50"
                    >
                      <RotateCcw className="size-3" />
                      {restoring === entry.id ? 'Restauration...' : 'Restaurer'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
