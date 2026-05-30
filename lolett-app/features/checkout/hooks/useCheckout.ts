'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, useCartCalculation } from '@/features/cart';
import { useAuth } from '@/lib/auth/context';
import { getProfile } from '@/lib/adapters/supabase-user';
import { getAddresses } from '@/lib/adapters/supabase-user';
import { SHIPPING_COUNTRIES, getShippingCarrier, getShippingCountry } from '@/lib/constants';
import type { UserAddress, ShippingCountryCode, ShippingMethod, PickupPoint } from '@/types';

// Helper pur (testable) : détermine si un point de retrait est requis et
// s'il manque. mondial_relay ET click_collect exigent un point sélectionné.
export function computePickupValidity(
  method: ShippingMethod,
  pickupPoint: PickupPoint | null,
): { requiresPickupPoint: boolean; missing: boolean } {
  const requiresPickupPoint = method === 'mondial_relay' || method === 'click_collect';
  return {
    requiresPickupPoint,
    missing: requiresPickupPoint && !pickupPoint,
  };
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: ShippingCountryCode;
}

const initialFormData: CheckoutFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'FR',
};

// Normalise un nom de pays libre (ex: "France", "Espagne", "es", "ES") vers un
// code ISO supporté. Renvoie 'FR' par défaut si la valeur est inconnue.
function normalizeCountry(input: string | undefined | null): ShippingCountryCode {
  if (!input) return 'FR';
  const upper = input.trim().toUpperCase();
  const byCode = SHIPPING_COUNTRIES.find((c) => c.code === upper);
  if (byCode) return byCode.code;
  const byName = SHIPPING_COUNTRIES.find((c) => c.name.toUpperCase() === upper);
  if (byName) return byName.code;
  return 'FR';
}

export function useCheckout() {
  const router = useRouter();
  const { user } = useAuth();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const giftCard = useCartStore((state) => state.giftCard);
  const promo = useCartStore((state) => state.promo);
  const shippingCountry = useCartStore((state) => state.shippingCountry);
  const shippingMethod = useCartStore((state) => state.shippingMethod);
  const pickupPoint = useCartStore((state) => state.pickupPoint);
  const setShippingCountry = useCartStore((state) => state.setShippingCountry);
  const { cartProducts, shipping, total } = useCartCalculation(items);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CheckoutFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'demo'>('card');

  // Load user profile + addresses if logged in
  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      setLoadingAddresses(true);
      try {
        const [profile, addresses] = await Promise.all([
          getProfile(user.id),
          getAddresses(user.id),
        ]);

        if (profile) {
          setFormData((prev) => ({
            ...prev,
            firstName: profile.firstName || prev.firstName,
            lastName: profile.lastName || prev.lastName,
            email: user.email || prev.email,
            phone: profile.phone || prev.phone,
          }));
        }

        if (addresses.length > 0) {
          setSavedAddresses(addresses);
          const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
          selectAddress(defaultAddr);
        }
      } catch {
        // silently fail
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const selectAddress = useCallback((addr: UserAddress) => {
    setSelectedAddressId(addr.id);
    const code = normalizeCountry(addr.country);
    setFormData((prev) => ({
      ...prev,
      firstName: addr.firstName || prev.firstName,
      lastName: addr.lastName || prev.lastName,
      address: addr.address,
      city: addr.city,
      postalCode: addr.postalCode,
      country: code,
    }));
    setShippingCountry(code);
  }, [setShippingCountry]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'country') {
      const code = normalizeCountry(value);
      setFormData((prev) => ({ ...prev, country: code }));
      setShippingCountry(code);
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (['address', 'city', 'postalCode'].includes(name)) {
      setSelectedAddressId(null);
    }
  };

  const setAddressFields = useCallback((fields: { address: string; postalCode: string; city: string }) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    setSelectedAddressId(null);
  }, []);

  const goToPayment = () => {
    if (isFormValid) setStep(2);
  };

  const goBackToShipping = () => {
    setStep(1);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderItems = cartProducts.map((cp) => ({
        productId: cp.productId,
        productName: cp.product.name,
        size: cp.size,
        quantity: cp.quantity,
        price: cp.product.price,
      }));

      // Le payload `customer.country` reste le nom complet pour rétrocompat
      // avec les emails et l'admin existants. Le code ISO est transmis à part.
      const countryName = getShippingCountry(formData.country)?.name ?? 'France';
      const payload = {
        items: orderItems,
        customer: { ...formData, country: countryName },
        total,
        shipping,
        userId: user?.id,
        shippingMethod,
        shippingCarrier: getShippingCarrier(shippingMethod),
        shippingCountry: formData.country,
        pickupPoint: computePickupValidity(shippingMethod, pickupPoint).requiresPickupPoint ? pickupPoint : null,
        ...(giftCard?.code ? { giftCardCode: giftCard.code } : {}),
        ...(promo?.code ? { promoCode: promo.code } : {}),
      };

      // Stripe: redirect to Stripe Checkout hosted page
      if (paymentMethod === 'card') {
        const res = await fetch('/api/checkout/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Stripe checkout failed');
        const { url } = await res.json();
        if (url) {
          window.location.href = url;
          return; // Don't reset isSubmitting, page is redirecting
        }
        throw new Error('No Stripe URL returned');
      }

      // Demo fallback: create order directly
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          paymentProvider: 'demo',
        }),
      });

      if (!res.ok) throw new Error('Checkout failed');
      const { orderId } = await res.json();
      clearCart();
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch (error) {
      console.error('Checkout error:', error);
      setIsSubmitting(false);
    }
  };

  const validation = useMemo(() => {
    const country = getShippingCountry(formData.country);
    const errors: Partial<Record<keyof CheckoutFormData | 'pickupPoint', string>> = {};

    if (!formData.firstName) errors.firstName = 'Prénom requis';
    if (!formData.lastName) errors.lastName = 'Nom requis';
    if (!formData.email) errors.email = 'Email requis';
    if (!formData.address) errors.address = 'Adresse requise';
    if (!formData.city) errors.city = 'Ville requise';

    if (!formData.phone) {
      errors.phone = 'Téléphone requis';
    } else {
      // Accepte tout numéro international valide (FR, ES, etc.)
      // car le téléphone du client peut différer du pays de livraison.
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length < 8 || digits.length > 15) {
        errors.phone = 'Numéro de téléphone invalide';
      }
    }

    if (!formData.postalCode) {
      errors.postalCode = 'Code postal requis';
    } else if (country && !country.postalCodeRegex.test(formData.postalCode.trim())) {
      errors.postalCode = `Format invalide (ex: ${country.postalCodeExample})`;
    }

    const { missing: pickupMissing } = computePickupValidity(shippingMethod, pickupPoint);
    if (pickupMissing) {
      errors.pickupPoint = 'Merci de sélectionner un point de retrait';
    }

    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [formData, shippingMethod, pickupPoint]);

  const isFormValid = validation.isValid;
  const formErrors = validation.errors;

  return {
    step,
    formData,
    isSubmitting,
    isFormValid,
    formErrors,
    savedAddresses,
    selectedAddressId,
    loadingAddresses,
    total,
    shipping,
    shippingCountry,
    shippingMethod,
    pickupPoint,
    paymentMethod,
    setPaymentMethod,
    handleChange,
    setAddressFields,
    handleSubmit,
    goToPayment,
    goBackToShipping,
    selectAddress,
  };
}
