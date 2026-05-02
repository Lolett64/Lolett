'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2, AlertTriangle } from 'lucide-react';

interface LookDeleteButtonProps {
  lookId: string;
  lookTitle: string;
}

interface References {
  products: number;
}

export function LookDeleteButton({ lookId, lookTitle }: LookDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [refs, setRefs] = useState<References | null>(null);
  const [error, setError] = useState('');

  async function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setError('');
      setRefs(null);
      setChecking(true);
      try {
        const res = await fetch(`/api/admin/looks/${lookId}/references`);
        if (res.ok) {
          const data = (await res.json()) as References;
          setRefs(data);
        }
      } finally {
        setChecking(false);
      }
    }
  }

  async function handleDelete() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/looks/${lookId}`, { method: 'DELETE' });
      if (res.ok) {
        setOpen(false);
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? `Erreur ${res.status}`);
    } finally {
      setLoading(false);
    }
  }

  const hasProducts = (refs?.products ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le look</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3">
              <p>
                Le look <strong>&ldquo;{lookTitle}&rdquo;</strong> va être supprimé.
              </p>

              {checking && (
                <p className="text-sm text-muted-foreground">Vérification des dépendances...</p>
              )}

              {refs && hasProducts && (
                <div className="rounded-md border border-orange-300 bg-orange-50 p-3 text-sm text-orange-900">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-medium">
                        Ce look contient {refs.products} produit
                        {refs.products > 1 ? 's' : ''} associé{refs.products > 1 ? 's' : ''}.
                      </p>
                      <p>
                        La suppression retire uniquement les associations look-produit. Les
                        produits eux-mêmes ne sont pas supprimés.
                      </p>
                      <p>
                        Si ce look est mis en avant sur la page d&apos;accueil, il y disparaîtra
                        automatiquement.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {refs && !hasProducts && (
                <p className="text-sm text-muted-foreground">
                  Aucun produit associé. Cette action est irréversible.
                </p>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading || checking}>
            {loading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
