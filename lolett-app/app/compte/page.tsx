'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Package, MapPin, Heart, Award, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getProfile, getUserOrders } from '@/lib/adapters/supabase-user';
import type { UserProfile } from '@/types';

const quickLinks = [
  { href: '/compte/profil', label: 'Mon profil', icon: User, desc: 'Modifier mes informations' },
  { href: '/compte/commandes', label: 'Mes commandes', icon: Package, desc: 'Suivre mes achats' },
  { href: '/compte/adresses', label: 'Mes adresses', icon: MapPin, desc: 'Gerer mes adresses' },
  { href: '/compte/favoris', label: 'Mes favoris', icon: Heart, desc: 'Mes articles sauvegardes' },
  { href: '/compte/fidelite', label: 'Fidelite', icon: Award, desc: 'Points et recompenses' },
];

export default function CompteDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      getProfile(user.id).then(setProfile);
      getUserOrders(user.id).then((orders) => setOrderCount(orders.length));
    }
  }, [user]);

  const firstName = profile?.firstName || user?.user_metadata?.first_name || '';

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-playfair text-2xl text-[#1a1510] sm:text-3xl">
          {firstName ? `Bienvenue, ${firstName}` : 'Bienvenue'}
        </h1>
        <p className="text-[#5a4d3e] font-body text-sm mt-1">
          Gerez votre compte et suivez vos commandes.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[#c4b49c]/15 shadow-sm p-5 text-center">
          <p className="font-playfair text-2xl text-[#1B0B94]">{profile?.loyaltyPoints ?? 0}</p>
          <p className="text-xs text-[#8a7d6b] font-body mt-1">Points fidelite</p>
        </div>
        <div className="bg-white rounded-xl border border-[#c4b49c]/15 shadow-sm p-5 text-center">
          <p className="font-playfair text-2xl text-[#1B0B94]">{orderCount ?? 0}</p>
          <p className="text-xs text-[#8a7d6b] font-body mt-1">Commandes</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-xl border border-[#c4b49c]/15 shadow-sm p-5 hover:border-[#1B0B94]/30 transition-colors group"
          >
            <Icon className="h-5 w-5 text-[#1B0B94] mb-3" />
            <h3 className="font-body text-sm font-semibold text-[#1a1510] group-hover:text-[#1B0B94] transition-colors">{label}</h3>
            <p className="text-xs text-[#8a7d6b] font-body mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
