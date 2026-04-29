'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Download, Trash2, X } from 'lucide-react';

export function RgpdSection() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetch('/api/account/export', { method: 'GET' });
      if (!res.ok) {
        throw new Error('Erreur lors de l’export');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cd = res.headers.get('content-disposition') || '';
      const match = cd.match(/filename="?([^"]+)"?/);
      a.download = match?.[1] || `lolett-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (confirmText !== 'SUPPRIMER') return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'SUPPRIMER' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }
      // Compte supprimé — redirige vers home
      router.push('/?deleted=1');
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erreur inconnue');
      setDeleting(false);
    }
  };

  return (
    <div className="mt-8 bg-[#FEFAF3] rounded-xl border border-[#c4b49c]/15 shadow-sm p-6 sm:p-8">
      <h2 className="font-playfair text-xl text-[#1a1510] mb-2">Vos données personnelles</h2>
      <p className="text-sm text-[#5a4d3e] font-body mb-6">
        Conformément au RGPD, vous pouvez à tout moment télécharger une copie de vos données ou
        supprimer définitivement votre compte.
      </p>

      <div className="space-y-4">
        {/* Export */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-white border border-[#c4b49c]/20">
          <div className="flex-1">
            <p className="font-body text-sm font-medium text-[#1a1510]">Télécharger mes données</p>
            <p className="text-xs text-[#8a7d6b] font-body mt-1">
              Export JSON de votre profil, commandes, adresses et favoris (article 20 RGPD).
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B0B94] hover:bg-[#B89547] text-white font-body text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            {exporting ? 'Export…' : 'Télécharger'}
          </button>
        </div>
        {exportError && (
          <p className="text-xs text-red-600 font-body">{exportError}</p>
        )}

        {/* Delete */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex-1">
            <p className="font-body text-sm font-medium text-red-900">Supprimer mon compte</p>
            <p className="text-xs text-red-700 font-body mt-1">
              Action irréversible. Vos commandes seront anonymisées (obligation comptable).
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-body text-sm font-semibold transition-colors"
          >
            <Trash2 size={14} />
            Supprimer
          </button>
        </div>
      </div>

      {/* Modale de confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[#FEFAF3] rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setConfirmText('');
                setDeleteError(null);
              }}
              disabled={deleting}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-[#1B0B94]/5 transition-colors disabled:opacity-50"
              aria-label="Fermer"
            >
              <X size={16} className="text-[#1B0B94]" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <h3 className="font-playfair text-lg text-[#1a1510]">Supprimer définitivement</h3>
            </div>

            <p className="text-sm text-[#5a4d3e] font-body mb-3">
              Cette action est <strong>irréversible</strong>. Seront supprimés ou anonymisés :
            </p>
            <ul className="text-xs text-[#5a4d3e] font-body mb-5 space-y-1 pl-4 list-disc">
              <li>Profil, adresses, favoris, panier</li>
              <li>Commandes (anonymisées, conservées pour la comptabilité)</li>
              <li>Avis (anonymisés)</li>
              <li>Inscriptions newsletter</li>
            </ul>

            <label className="block text-sm text-[#5a4d3e] font-body mb-2">
              Tapez <strong className="text-red-700">SUPPRIMER</strong> pour confirmer :
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={deleting}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-red-300 text-[#1a1510] font-body text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 disabled:opacity-50"
              placeholder="SUPPRIMER"
              autoFocus
            />

            {deleteError && (
              <p className="text-xs text-red-600 font-body mt-2">{deleteError}</p>
            )}

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmText('');
                  setDeleteError(null);
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[#c4b49c]/30 text-[#5a4d3e] font-body text-sm font-medium hover:bg-[#1B0B94]/5 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || confirmText !== 'SUPPRIMER'}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-body text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Suppression…' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
