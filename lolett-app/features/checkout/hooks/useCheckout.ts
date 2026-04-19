'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, useCartCalculation } from '@/features/cart';
import { useAuth } from '@/lib/auth/context';
import { getProfile } from '@/lib/adapters/supabase-user';
import { getAddresses } from '@/lib/adapters/supabase-user';
import type { UserAddress } from '@/types';

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

const initialFormData: CheckoutFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'France',
};

export function useCheckout() {
  const router = useRouter();
  const { user } = useAuth();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
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
    setFormData((prev) => ({
      ...prev,
      firstName: addr.firstName || prev.firstName,
      lastName: addr.lastName || prev.lastName,
      address: addr.address,
      city: addr.city,
      postalCode: addr.postalCode,
      country: addr.country,
    }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (['address', 'city', 'postalCode'].includes(e.target.name)) {
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

      const payload = {
        items: orderItems,
        customer: formData,
        total,
        shipping,
        userId: user?.id,
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

  const isFormValid = !!(
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.address &&
    formData.city &&
    formData.postalCode
  );

  return {
    step,
    formData,
    isSubmitting,
    isFormValid,
    savedAddresses,
    selectedAddressId,
    loadingAddresses,
    total,
    shipping,
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
