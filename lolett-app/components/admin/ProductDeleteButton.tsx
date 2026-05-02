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

interface ProductDeleteButtonProps {
  productId: string;
  productName: string;
}

interface References {
  orders: number;
  looks: number;
  carts: number;
  favorites: number;
}

export function ProductDeleteButton({ productId, productName }: ProductDeleteButtonProps) {
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
        const res = await fetch(`/api/admin/products/${productId}/references`);
        if (res.ok) {
          const data = (await res.json()) as References;
          setRefs(data);
        }
      } finally {
        setChecking(false);
      }
    }
  }

  async function handleDelete(force = false) {
    setLoading(true);
    setError('');
    try {
      const url = force
        ? `/api/admin/products/${productId}?force=true`
        : `/api/admin/products/${productId}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        setOpen(false);
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        references?: References;
      };
      if (res.status === 409 && data.references) {
        setRefs(data.references);
        setError(data.error ?? 'Produit référencé dans des commandes ou paniers actifs');
      } else {
        setError(data.error ?? `Erreur ${res.status}`);
      }
    } finally {
      setLoading(false);
    }
  }

  const hasOrders = (refs?.orders ?? 0) > 0;
  const hasCarts = (refs?.carts ?? 0) > 0;
  const hasActiveRefs = hasOrders || hasCarts;
  const hasOtherRefs =
    (refs?.looks ?? 0) > 0 || (refs?.favorites ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le produit</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3">
              <p>
                Le produit <strong>&ldquo;{productName}&rdquo;</strong> va être supprimé.
              </p>

              {checking && (
                <p className="text-sm text-muted-foreground">Vérification des dépendances...</p>
              )}

              {refs && hasActiveRefs && (
                <div className="rounded-md border border-orange-300 bg-orange-50 p-3 text-sm text-orange-900">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      {hasOrders && (
                        <p className="font-medium">
                          Ce produit apparaît dans {refs.orders} commande
                          {refs.orders > 1 ? 's' : ''} existante{refs.orders > 1 ? 's' : ''}.
                        </p>
                      )}
                      {hasCarts && (
                        <p className="font-medium">
                          Il est actuellement dans {refs.carts} panier
                          {refs.carts > 1 ? 's' : ''} client{refs.carts > 1 ? 's' : ''} actif
                          {refs.carts > 1 ? 's' : ''}.
                        </p>
                      )}
                      {hasOrders && (
                        <p>
                          Le supprimer rendra l&apos;historique de ces commandes incomplet (le nom
                          et le prix restent affichés mais la fiche produit ne sera plus
                          accessible).
                        </p>
                      )}
                      {hasCarts && !hasOrders && (
                        <p>
                          Le supprimer videra le produit de ces paniers sans prévenir les
                          clientes.
                        </p>
                      )}
                      <p className="font-medium">
                        Préfère retirer ses stocks pour le rendre indisponible plutôt que de le
                        supprimer.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {refs && hasOtherRefs && (
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-0.5">
                  {refs.looks > 0 && (
                    <li>
                      Présent dans {refs.looks} look{refs.looks > 1 ? 's' : ''} (sera retiré
                      automatiquement)
                    </li>
                  )}
                  {refs.favorites > 0 && (
                    <li>
                      Dans {refs.favorites} liste{refs.favorites > 1 ? 's' : ''} de favoris
                    </li>
                  )}
                </ul>
              )}

              {refs && !hasActiveRefs && !hasOtherRefs && (
                <p className="text-sm text-muted-foreground">
                  Aucune dépendance détectée. Cette action est irréversible.
                </p>
              )}

              {error && !hasActiveRefs && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Annuler
          </Button>
          {hasActiveRefs ? (
            <Button
              variant="destructive"
              onClick={() => handleDelete(true)}
              disabled={loading || checking}
            >
              {loading ? 'Suppression...' : 'Supprimer quand même'}
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={() => handleDelete(false)}
              disabled={loading || checking}
            >
              {loading ? 'Suppression...' : 'Supprimer'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
