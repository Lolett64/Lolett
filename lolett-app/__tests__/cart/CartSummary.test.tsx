import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CartSummary } from '@/components/cart/CartSummary';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

describe('CartSummary', () => {
  it('affiche le sous-total, livraison et total', () => {
    render(
      <CartSummary subtotal={80} shipping={5.9} total={85.9} isFreeShipping={false} amountUntilFreeShipping={20} />,
    );
    // Sous-total
    const subtotalRow = screen.getByText('Sous-total').closest('div')!;
    expect(subtotalRow.textContent).toContain('80,00');
    // Livraison
    const livraisonRow = screen.getByText('Livraison').closest('div')!;
    expect(livraisonRow.textContent).toContain('5,90');
    // Total
    const totalRow = screen.getByText('Total').closest('div')!;
    expect(totalRow.textContent).toContain('85,90');
  });

  it('affiche "Offerte" quand la livraison est gratuite', () => {
    render(
      <CartSummary subtotal={120} shipping={0} total={120} isFreeShipping={true} amountUntilFreeShipping={0} />,
    );
    expect(screen.getByText('Offerte')).toBeInTheDocument();
  });

  it('affiche le montant restant pour la livraison gratuite', () => {
    render(
      <CartSummary subtotal={80} shipping={5.9} total={85.9} isFreeShipping={false} amountUntilFreeShipping={20} />,
    );
    expect(screen.getByText(/20,00/)).toBeInTheDocument();
    expect(screen.getByText(/livraison gratuite/)).toBeInTheDocument();
  });

  it('n\'affiche pas la barre de progression quand livraison gratuite', () => {
    render(
      <CartSummary subtotal={120} shipping={0} total={120} isFreeShipping={true} amountUntilFreeShipping={0} />,
    );
    expect(screen.queryByText(/livraison gratuite/)).not.toBeInTheDocument();
  });

  it('affiche le bouton "Passer commande" avec lien vers /checkout', () => {
    render(
      <CartSummary subtotal={80} shipping={5.9} total={85.9} isFreeShipping={false} amountUntilFreeShipping={20} />,
    );
    expect(screen.getByText('Passer commande')).toBeInTheDocument();
    const checkoutLink = screen.getAllByRole('link').find((l) => l.getAttribute('href') === '/checkout');
    expect(checkoutLink).toBeTruthy();
  });

  it('affiche le lien "Continuer mes achats" vers /shop', () => {
    render(
      <CartSummary subtotal={80} shipping={5.9} total={85.9} isFreeShipping={false} amountUntilFreeShipping={20} />,
    );
    expect(screen.getByText('Continuer mes achats')).toBeInTheDocument();
    const shopLink = screen.getAllByRole('link').find((l) => l.getAttribute('href') === '/shop');
    expect(shopLink).toBeTruthy();
  });

  it('affiche les garanties (sécurisé, livraison, retours)', () => {
    render(
      <CartSummary subtotal={80} shipping={5.9} total={85.9} isFreeShipping={false} amountUntilFreeShipping={20} />,
    );
    expect(screen.getByText(/Paiement 100% sécurisé/)).toBeInTheDocument();
    expect(screen.getByText(/Livraison 3-5 jours/)).toBeInTheDocument();
    expect(screen.getByText(/Retours gratuits sous 14 jours/)).toBeInTheDocument();
  });
});
