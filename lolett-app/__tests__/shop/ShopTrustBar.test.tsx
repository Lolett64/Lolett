import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ShopTrustBar } from '@/components/shop/ShopTrustBar';

describe('ShopTrustBar', () => {
  const items = [
    { title: 'Livraison rapide', desc: 'Expédié sous 48h' },
    { title: 'Paiement sécurisé', desc: 'CB, PayPal, Apple Pay' },
    { title: 'Retours gratuits', desc: 'Sous 14 jours' },
  ];

  it('affiche tous les items de confiance', () => {
    render(<ShopTrustBar items={items} />);
    expect(screen.getByText('Livraison rapide')).toBeInTheDocument();
    expect(screen.getByText('Paiement sécurisé')).toBeInTheDocument();
    expect(screen.getByText('Retours gratuits')).toBeInTheDocument();
  });

  it('affiche les descriptions', () => {
    render(<ShopTrustBar items={items} />);
    expect(screen.getByText('Expédié sous 48h')).toBeInTheDocument();
    expect(screen.getByText('CB, PayPal, Apple Pay')).toBeInTheDocument();
    expect(screen.getByText('Sous 14 jours')).toBeInTheDocument();
  });

  it('gère une liste vide sans crash', () => {
    render(<ShopTrustBar items={[]} />);
    // Pas de contenu mais pas d'erreur
    expect(document.querySelector('section')).toBeInTheDocument();
  });

  it('gère un seul item', () => {
    render(<ShopTrustBar items={[{ title: 'Qualité', desc: 'Premium' }]} />);
    expect(screen.getByText('Qualité')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it('se met à jour avec de nouveaux items CMS', () => {
    const { rerender } = render(<ShopTrustBar items={items} />);
    expect(screen.getByText('Livraison rapide')).toBeInTheDocument();

    rerender(<ShopTrustBar items={[{ title: 'Fait main', desc: 'Artisanal' }]} />);
    expect(screen.getByText('Fait main')).toBeInTheDocument();
    expect(screen.queryByText('Livraison rapide')).not.toBeInTheDocument();
  });
});
