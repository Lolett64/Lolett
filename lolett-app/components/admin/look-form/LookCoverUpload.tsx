'use client';

import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface LookCoverUploadProps {
  coverUrl: string;
  onUpload: (url: string) => void;
}

const card = 'w-full rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm';
const sectionTitle = 'text-base font-semibold text-[#1a1a24] mb-4';

export function LookCoverUpload({ coverUrl, onUpload }: LookCoverUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCoverUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Erreur upload (${res.status})`);
        return;
      }
      if (data.url) onUpload(data.url);
      else setError('Réponse invalide du serveur');
    } catch {
      setError('Erreur réseau — vérifiez votre connexion');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={card}>
      <h3 className={sectionTitle}>Image de couverture</h3>

      {coverUrl ? (
        <div style={{ position: 'relative', width: '100%', maxWidth: '24rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt="Cover"
            style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: '0.5rem' }}
          />
          <button
            type="button"
            onClick={() => onUpload('')}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              borderRadius: '50%',
              background: '#e53935',
              border: 'none',
              padding: 4,
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            borderRadius: '0.5rem',
            border: '2px dashed #d1d1dc',
            padding: '2rem',
            cursor: 'pointer',
          }}
        >
          <Upload style={{ width: 32, height: 32, color: '#9999a8' }} />
          <p style={{ fontSize: '0.875rem', color: '#6b6b7a' }}>Cliquer pour uploader une image</p>
          {uploading && <p style={{ fontSize: '0.75rem', color: '#1B0B94' }}>Upload en cours...</p>}
        </div>
      )}
      {error && (
        <p style={{ fontSize: '0.875rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
          {error}
        </p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        style={{ display: 'none' }}
        onChange={(e) => handleCoverUpload(e.target.files)}
      />
    </div>
  );
}
