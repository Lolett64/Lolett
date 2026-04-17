import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LookCoverUpload } from '@/components/admin/look-form/LookCoverUpload';

describe('LookCoverUpload', () => {
  const onUpload = vi.fn();

  beforeEach(() => {
    onUpload.mockClear();
    vi.restoreAllMocks();
  });

  it('affiche le titre "Image de couverture"', () => {
    render(<LookCoverUpload coverUrl="" onUpload={onUpload} />);
    expect(screen.getByText('Image de couverture')).toBeInTheDocument();
  });

  it('affiche la zone de drop quand pas de cover', () => {
    render(<LookCoverUpload coverUrl="" onUpload={onUpload} />);
    expect(screen.getByText(/Cliquer pour uploader/)).toBeInTheDocument();
  });

  it('affiche l\'image quand coverUrl est fourni', () => {
    render(<LookCoverUpload coverUrl="https://example.com/cover.jpg" onUpload={onUpload} />);
    const img = screen.getByAltText('Cover');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg');
  });

  it('upload réussi — appelle onUpload avec l\'URL', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ url: 'https://cdn.example.com/cover.jpg' }), { status: 200 }),
    );

    render(<LookCoverUpload coverUrl="" onUpload={onUpload} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['img'], 'cover.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith('https://cdn.example.com/cover.jpg');
    });
  });

  it('upload échoué (HTTP error) — affiche l\'erreur', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Format non supporté' }), { status: 400 }),
    );

    render(<LookCoverUpload coverUrl="" onUpload={onUpload} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['img'], 'cover.bmp', { type: 'image/bmp' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Format non supporté')).toBeInTheDocument();
    });
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('erreur réseau — affiche le message réseau', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('offline'));

    render(<LookCoverUpload coverUrl="" onUpload={onUpload} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['img'], 'cover.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Erreur réseau/)).toBeInTheDocument();
    });
  });

  it('réponse sans URL — affiche erreur réponse invalide', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    render(<LookCoverUpload coverUrl="" onUpload={onUpload} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['img'], 'cover.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Réponse invalide du serveur')).toBeInTheDocument();
    });
  });
});
