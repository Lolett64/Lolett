import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentVideoUpload } from '@/components/admin/ContentVideoUpload';

describe('ContentVideoUpload', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockClear();
    vi.restoreAllMocks();
  });

  it('affiche le label', () => {
    render(<ContentVideoUpload value="" onChange={onChange} label="Vidéo produit" />);
    expect(screen.getByText('Vidéo produit')).toBeInTheDocument();
  });

  it('affiche la zone de drop quand pas de vidéo', () => {
    render(<ContentVideoUpload value="" onChange={onChange} label="Vidéo" />);
    expect(screen.getByText(/Glissez une vidéo/)).toBeInTheDocument();
    expect(screen.getByText(/MP4, WebM/)).toBeInTheDocument();
  });

  it('affiche un player vidéo quand valeur contient .mp4', () => {
    render(<ContentVideoUpload value="/videos/demo.mp4" onChange={onChange} label="Vidéo" />);
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', '/videos/demo.mp4');
  });

  it('affiche le nom du fichier pour une URL non-mp4', () => {
    render(<ContentVideoUpload value="https://youtube.com/embed/abc" onChange={onChange} label="Vidéo" />);
    expect(screen.getByText('https://youtube.com/embed/abc')).toBeInTheDocument();
  });

  it('appelle onChange("") quand on clique Supprimer', async () => {
    const user = userEvent.setup();
    render(<ContentVideoUpload value="/videos/demo.mp4" onChange={onChange} label="Vidéo" />);
    await user.click(screen.getByText('Supprimer'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('upload réussi — appelle onChange avec l\'URL', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ url: '/storage/video.mp4' }), { status: 200 }),
    );

    render(<ContentVideoUpload value="" onChange={onChange} label="Vidéo" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['video'], 'clip.mp4', { type: 'video/mp4' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('/storage/video.mp4');
    });
  });

  it('upload échoué — affiche l\'erreur serveur', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Taille max dépassée' }), { status: 413 }),
    );

    render(<ContentVideoUpload value="" onChange={onChange} label="Vidéo" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['video'], 'clip.mp4', { type: 'video/mp4' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('Taille max dépassée')).toBeInTheDocument();
    });
  });

  it('mode URL — permet de coller une URL vidéo', async () => {
    const user = userEvent.setup();
    render(<ContentVideoUpload value="" onChange={onChange} label="Vidéo" />);

    await user.click(screen.getByText('Ou coller une URL vidéo'));
    const urlInput = screen.getByPlaceholderText(/https/);
    expect(urlInput).toBeInTheDocument();

    await user.type(urlInput, 'https://cdn.example.com/video.mp4');
    expect(onChange).toHaveBeenCalled();
  });

  it('erreur réseau — affiche message réseau', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('offline'));

    render(<ContentVideoUpload value="" onChange={onChange} label="Vidéo" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['video'], 'clip.mp4', { type: 'video/mp4' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/Erreur réseau/)).toBeInTheDocument();
    });
  });
});
