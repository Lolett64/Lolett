'use client';

import { Lock } from 'lucide-react';
import { BrandHeading } from '@/components/brand/BrandHeading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCheckout } from '../hooks/useCheckout';

export function CheckoutForm() {
  const { formData, isSubmitting, isFormValid, handleChange, handleSubmit } = useCheckout();

  return (
    <div className="rounded-2xl bg-white p-5 sm:p-8">
      <BrandHeading as="h1" size="lg" className="mb-8">
        Finaliser ma commande
      </BrandHeading>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
            className="rounded-lg"
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="rounded-lg"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="postalCode">Code postal</Label>
            <Input
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              required
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Pays</Label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            disabled
            className="bg-lolett-gray-100 rounded-lg"
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={!isFormValid || isSubmitting}
            className="bg-lolett-gold hover:bg-lolett-gold-light w-full rounded-full"
          >
            {isSubmitting ? (
              'Traitement en cours...'
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Confirmer la commande
              </>
            )}
          </Button>
          <p className="text-lolett-gray-500 mt-3 text-center text-xs">
            Paiement simulé - Aucune transaction réelle
          </p>
        </div>
      </form>
    </div>
  );
}
