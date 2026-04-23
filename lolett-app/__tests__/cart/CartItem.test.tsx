import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartItem } from '@/components/cart/CartItem';
import type { CartProductItem } from '@/features/cart';

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props;
    return <img {...rest} />;
  },
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

const mockItem: CartProductItem = {
  productId: 'prod-1',
  size: 'M',
  color: 'Noir',
  quantity: 2,
  addedAt: '2026-04-16',
  product: {
    id: 'prod-1',
    slug: 'tshirt-classique',
    name: 'T-Shirt Classique',
    gender: 'homme',
    categorySlug: 'tshirts',
    price: 45,
    images: ['/images/tshirt.jpg'],
    description: 'Un t-shirt classique',
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Noir', hex: '#000000' }, { name: 'Blanc', hex: '#FFFFFF' }],
    stock: 10,
    isNew: false,
    tags: [],
  },
};

describe('CartItem', () => {
  const removeItem = vi.fn();
  const updateQuantity = vi.fn();

  beforeEach(() => {
    removeItem.mockClear();
    updateQuantity.mockClear();
  });

  it('affiche le nom du produit', () => {
    render(<CartItem item={mockItem} removeItem={removeItem} updateQuantity={updateQuantity} />);
    expect(screen.getByText('T-Shirt Classique')).toBeInTheDocument();
  });

  it('affiche la taille et la couleur', () => {
    render(<CartItem item={mockItem} removeItem={removeItem} updateQuantity={updateQuantity} />);
    expect(screen.getByText('Taille M')).toBeInTheDocument();
    expect(screen.getByText('Noir')).toBeInTheDocument();
  });

  it('affiche la quantité', () => {
    render(<CartItem item={mockItem} removeItem={removeItem} updateQuantity={updateQuantity} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('affiche le prix total (prix x quantité)', () => {
    render(<CartItem item={mockItem} removeItem={removeItem} updateQuantity={updateQuantity} />);
    // 45 * 2 = 90 → "90,00 €"
    expect(screen.getByText(/90,00/)).toBeInTheDocument();
  });

  it('appelle removeItem au clic sur X', async () => {
    const user = userEvent.setup();
    render(<CartItem item={mockItem} removeItem={removeItem} updateQuantity={updateQuantity} />);

    // Le bouton X est le dernier bouton dans le header
    const buttons = screen.getAllByRole('button');
    const removeBtn = buttons[0]; // premier bouton = X
    await user.click(removeBtn);

    expect(removeItem).toHaveBeenCalledWith('prod-1', 'M', 'Noir');
  });

  it('incrémente la quantité au clic sur +', async () => {
    const user = userEvent.setup();
    render(<CartItem item={mockItem} removeItem={removeItem} updateQuantity={updateQuantity} />);

    const buttons = screen.getAllByRole('button');
    // Boutons: X, -, +
    const plusBtn = buttons[buttons.length - 1];
    await user.click(plusBtn);

    expect(updateQuantity).toHaveBeenCalledWith('prod-1', 'M', 3, 'Noir');
  });

  it('décrémente la quantité au clic sur -', async () => {
    const user = userEvent.setup();
    render(<CartItem item={mockItem} removeItem={removeItem} updateQuantity={updateQuantity} />);

    const buttons = screen.getAllByRole('button');
    // Boutons: X, -, +
    const minusBtn = buttons[buttons.length - 2];
    await user.click(minusBtn);

    expect(updateQuantity).toHaveBeenCalledWith('prod-1', 'M', 1, 'Noir');
  });

  it('rend le lien vers la page produit', () => {
    render(<CartItem item={mockItem} removeItem={removeItem} updateQuantity={updateQuantity} />);
    const links = screen.getAllByRole('link');
    const productLinks = links.filter((l) => l.getAttribute('href') === '/produit/tshirt-classique');
    expect(productLinks.length).toBeGreaterThan(0);
  });

  it('gère un item sans couleur', () => {
    const itemSansCouleur = { ...mockItem, color: undefined };
    render(<CartItem item={itemSansCouleur} removeItem={removeItem} updateQuantity={updateQuantity} />);
    expect(screen.getByText('Taille M')).toBeInTheDocument();
    expect(screen.queryByText('·')).not.toBeInTheDocument();
  });
});
