import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentImageUpload } from '@/components/admin/ContentImageUpload';

describe('ContentImageUpload', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockClear();
    vi.restoreAllMocks();
  });

  it('affiche le label', () => {
    render(<ContentImageUpload value="" onChange={onChange} label="Photo produit" />);
    expect(screen.getByText('Photo produit')).toBeInTheDocument();
  });

  it('affiche le texte de drop zone quand pas d\'image', () => {
    render(<ContentImageUpload value="" onChange={onChange} label="Photo" />);
    expect(screen.getByText(/Glissez une image/)).toBeInTheDocument();
  });

  it('affiche l\'image quand une valeur est fournie', () => {
    render(<ContentImageUpload value="https://example.com/img.jpg" onChange={onChange} label="Photo" />);
    const img = screen.getByAltText('Photo');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg');
  });

  it('appelle onChange("") quand on clique Supprimer', async () => {
    const user = userEvent.setup();
    render(<ContentImageUpload value="https://example.com/img.jpg" onChange={onChange} label="Photo" />);
    await user.click(screen.getByText('Supprimer'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('upload réussi — appelle onChange avec l\'URL retournée', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ url: 'https://cdn.example.com/uploaded.jpg' }), { status: 200 }),
    );

    render(<ContentImageUpload value="" onChange={onChange} label="Photo" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('https://cdn.example.com/uploaded.jpg');
    });
  });

  it('upload échoué (HTTP 500) — affiche l\'erreur', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Fichier trop volumineux' }), { status: 500 }),
    );

    render(<ContentImageUpload value="" onChange={onChange} label="Photo" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('Fichier trop volumineux')).toBeInTheDocument();
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('erreur réseau — affiche le message réseau', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    render(<ContentImageUpload value="" onChange={onChange} label="Photo" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/Erreur réseau/)).toBeInTheDocument();
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('réponse sans URL — affiche erreur réponse invalide', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    render(<ContentImageUpload value="" onChange={onChange} label="Photo" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('Réponse invalide du serveur')).toBeInTheDocument();
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
