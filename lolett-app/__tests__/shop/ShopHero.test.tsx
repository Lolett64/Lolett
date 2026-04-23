import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ShopHero } from '@/components/shop/ShopHero';

// Mock next/image pour rendre un <img> simple
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props;
    return <img {...rest} />;
  },
}));

// Mock next/link pour rendre un <a> simple
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

const defaultProps = {
  heroBadge: 'Nouvelle Collection',
  heroTitle: 'Boutique',
  heroSubtitle: 'Des pièces uniques pour lui et pour elle',
  hommeImage: '/images/homme.jpg',
  hommeLabel: 'Collection Été',
  hommeCategories: 'T-shirts, Pantalons, Vestes',
  femmeImage: '/images/femme.jpg',
  femmeLabel: 'Collection Printemps',
  femmeCategories: 'Robes, Jupes, Tops',
};

describe('ShopHero', () => {
  it('affiche le badge CMS', () => {
    render(<ShopHero {...defaultProps} />);
    expect(screen.getByText('Nouvelle Collection')).toBeInTheDocument();
  });

  it('affiche le titre principal', () => {
    render(<ShopHero {...defaultProps} />);
    expect(screen.getByText('Boutique')).toBeInTheDocument();
  });

  it('affiche le sous-titre', () => {
    render(<ShopHero {...defaultProps} />);
    expect(screen.getByText('Des pièces uniques pour lui et pour elle')).toBeInTheDocument();
  });

  it('affiche les labels homme et femme', () => {
    render(<ShopHero {...defaultProps} />);
    expect(screen.getByText('Collection Été')).toBeInTheDocument();
    expect(screen.getByText('Collection Printemps')).toBeInTheDocument();
  });

  it('affiche les catégories', () => {
    render(<ShopHero {...defaultProps} />);
    expect(screen.getByText('T-shirts, Pantalons, Vestes')).toBeInTheDocument();
    expect(screen.getByText('Robes, Jupes, Tops')).toBeInTheDocument();
  });

  it('rend les liens vers /shop/homme et /shop/femme', () => {
    render(<ShopHero {...defaultProps} />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/shop/homme');
    expect(hrefs).toContain('/shop/femme');
  });

  it('rend les images avec les bonnes sources CMS', () => {
    render(<ShopHero {...defaultProps} />);
    const hommeImg = screen.getByAltText('Collection Homme LOLETT');
    const femmeImg = screen.getByAltText('Collection Femme LOLETT');
    expect(hommeImg).toHaveAttribute('src', '/images/homme.jpg');
    expect(femmeImg).toHaveAttribute('src', '/images/femme.jpg');
  });

  it('met à jour quand les props CMS changent', () => {
    const { rerender } = render(<ShopHero {...defaultProps} />);
    expect(screen.getByText('Boutique')).toBeInTheDocument();

    rerender(<ShopHero {...defaultProps} heroTitle="Shop" heroBadge="Soldes" />);
    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('Soldes')).toBeInTheDocument();
  });
});
