'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface PickupPointRow {
  id: string;
  name: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  hours: string | null;
  instructions: string | null;
  is_active: boolean;
  sort_order: number;
}

interface PickupPointFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = création, sinon édition. */
  point: PickupPointRow | null;
  onSaved: () => void;
}

export function PickupPointFormModal({
  open,
  onOpenChange,
  point,
  onSaved,
}: PickupPointFormModalProps) {
  const isEdit = point !== null;
  const [name, setName] = useState(point?.name ?? '');
  const [address, setAddress] = useState(point?.address ?? '');
  const [postalCode, setPostalCode] = useState(point?.postal_code ?? '');
  const [city, setCity] = useState(point?.city ?? '');
  const [hours, setHours] = useState(point?.hours ?? '');
  const [instructions, setInstructions] = useState(point?.instructions ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setSaving(true);
    setError('');
    const payload = {
      name,
      address,
      postalCode,
      city,
      country: 'FR',
      hours: hours || null,
      instructions: instructions || null,
    };
    const url = isEdit
      ? `/api/admin/pickup-points/${point.id}`
      : '/api/admin/pickup-points';
    const method = isEdit ? 'PATCH' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'Erreur inconnue');
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-[family-name:var(--font-montserrat)] max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le point de retrait' : 'Ajouter un point de retrait'}</DialogTitle>
          <DialogDescription className="text-[#1a1510]/60">
            Les points sont masqués par défaut. Activez-les depuis la liste pour les rendre visibles au checkout.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pp-name">Nom de la boutique</Label>
            <Input id="pp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Boutique du Marais" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pp-address">Adresse</Label>
            <Input id="pp-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ex : 3 rue des Rosiers" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pp-postal">Code postal</Label>
              <Input id="pp-postal" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="75004" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pp-city">Ville</Label>
              <Input id="pp-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Paris" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pp-hours">Horaires (optionnel)</Label>
            <Input id="pp-hours" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Lun-Sam 10h-19h" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pp-instructions">Instructions de retrait (optionnel)</Label>
            <textarea
              id="pp-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              placeholder="Ex : sonnez à l'interphone Lolett, 1er étage."
              className="w-full resize-y rounded-md border border-[#e8e0d6] bg-white px-3 py-2 text-sm text-[#1a1510] placeholder:text-[#1a1510]/30 focus:border-[#1B0B94] focus:outline-none focus:ring-2 focus:ring-[#1B0B94]/20"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !name || !address || !postalCode || !city}
            className="bg-[#1B0B94] text-white hover:bg-[#130970]"
          >
            {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
