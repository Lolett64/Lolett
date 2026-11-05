import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProductFormInfoSection } from '@/components/admin/product-form/ProductFormInfoSection';
import AdminCategoriesPage from '@/app/admin/categories/page';
import type { ProductFormData } from '@/components/admin/product-form/types';

const categories = [
  { id: '1', gender: 'femme', slug: 'hauts', label: 'Hauts', seo_title: null, seo_description: null },
  { id: '2', gender: 'femme', slug: 'pull-gilet', label: 'Pulls & Gilets', seo_title: null, seo_description: null },
  { id: '3', gender: 'femme', slug: 'vestes', label: 'Vestes', seo_title: null, seo_description: null },
  { id: '4', gender: 'homme', slug: 'hauts', label: 'Hauts', seo_title: null, seo_description: null },
];

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
    Promise.resolve(
      new Response(JSON.stringify(init?.method === 'POST' ? [] : { categories, productCounts: {} }), {
        status: init?.method === 'POST' ? 201 : 200,
      }),
    ),
  );
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

describe('Fiche produit — liste des catégories (retour cliente)', () => {
  it('propose « Pulls & Gilets » et « Vestes » pour un produit Femme', async () => {
    const form = { gender: 'femme', category_slug: '', price: '' } as unknown as ProductFormData;
    render(<ProductFormInfoSection form={form} setForm={vi.fn()} onNameChange={vi.fn()} />);

    const select = screen.getByText('Catégorie *').parentElement!.querySelector('select')!;
    await waitFor(() => expect(within(select).getByText('Pulls & Gilets')).toBeInTheDocument());
    expect(within(select).getByText('Vestes')).toBeInTheDocument();
    expect(within(select).getAllByRole('option')).toHaveLength(4); // Choisir... + 3 Femme
  });
});

describe('Page Catégories — cocher Homme et Femme', () => {
  it('envoie les deux genres en une seule création', async () => {
    const user = userEvent.setup();
    render(<AdminCategoriesPage />);

    await user.click(await screen.findByRole('button', { name: /nouvelle catégorie/i }));
    await user.click(screen.getByRole('checkbox', { name: 'Homme' }));
    await user.click(screen.getByRole('checkbox', { name: 'Femme' }));
    await user.type(screen.getByLabelText('Label *'), 'Pulls & Gilets');
    await user.click(screen.getByRole('button', { name: 'Créer' }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith('/api/admin/categories', expect.objectContaining({ method: 'POST' })),
    );
    const post = fetchMock.mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === 'POST')!;
    const body = JSON.parse((post[1] as RequestInit).body as string);
    expect(body.genders).toEqual(['homme', 'femme']);
    expect(body.slug).toBe('pulls-gilets');
  });

  it('un slug tapé comme un nom est nettoyé et l’adresse est affichée', async () => {
    const user = userEvent.setup();
    render(<AdminCategoriesPage />);

    await user.click(await screen.findByRole('button', { name: /nouvelle catégorie/i }));
    await user.click(screen.getByRole('checkbox', { name: 'Femme' }));
    await user.type(screen.getByLabelText('Label *'), 'Pulls');
    const slug = screen.getByLabelText('Slug');
    await user.clear(slug);
    await user.type(slug, 'Pulls, Gilets & Sweats');

    expect(slug).toHaveValue('pulls-gilets-sweats');
    expect(screen.getByText('/shop/femme/pulls-gilets-sweats')).toBeInTheDocument();

    // tiret final pendant la frappe : l'aperçu montre l'adresse réellement enregistrée
    await user.type(slug, ' ');
    expect(slug).toHaveValue('pulls-gilets-sweats-');
    expect(screen.getByText('/shop/femme/pulls-gilets-sweats')).toBeInTheDocument();

    // Homme et Femme cochés : les deux adresses
    await user.click(screen.getByRole('checkbox', { name: 'Homme' }));
    expect(screen.getByText('/shop/homme/pulls-gilets-sweats')).toBeInTheDocument();
  });

  it('bloque la création si aucune case n’est cochée', async () => {
    const user = userEvent.setup();
    render(<AdminCategoriesPage />);

    await user.click(await screen.findByRole('button', { name: /nouvelle catégorie/i }));
    await user.type(screen.getByLabelText('Label *'), 'Test');
    await user.click(screen.getByRole('button', { name: 'Créer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Cochez Homme, Femme');
    expect(fetchMock.mock.calls.some(([, init]) => (init as RequestInit | undefined)?.method === 'POST')).toBe(false);
  });
});
