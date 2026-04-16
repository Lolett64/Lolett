import { RefObject } from 'react';
import { Upload, X } from 'lucide-react';
import { card, sectionTitle } from './types';

interface ProductFormImageSectionProps {
  images: string[];
  uploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onUpload: (files: FileList | null) => void;
  onRemove: (idx: number) => void;
}

export function ProductFormImageSection({
  images,
  uploading,
  fileInputRef,
  onUpload,
  onRemove,
}: ProductFormImageSectionProps) {
  return (
    <div className={card}>
      <h3 className={sectionTitle}>Images</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          <p style={{ fontSize: '0.875rem', color: '#6b6b7a' }}>
            Cliquer pour uploader des images (JPEG, PNG, WebP, AVIF — max 50MB)
          </p>
          {uploading && <p style={{ fontSize: '0.75rem', color: '#1B0B94' }}>Upload en cours...</p>}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => onUpload(e.target.files)}
        />

        {images.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {images.map((url, idx) => (
              <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '0.5rem', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Image ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    borderRadius: '50%',
                    background: '#e53935',
                    border: 'none',
                    padding: 2,
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <X style={{ width: 12, height: 12 }} />
                </button>
                {idx === 0 && (
                  <span style={{
                    position: 'absolute',
                    bottom: 4,
                    left: 4,
                    fontSize: '0.625rem',
                    background: '#f7f7fb',
                    color: '#4a4a56',
                    padding: '2px 6px',
                    borderRadius: '0.25rem',
                  }}>
                    Principale
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
