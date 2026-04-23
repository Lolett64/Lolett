'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Trash2, Loader2, Film } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ContentVideoUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
}

export function ContentVideoUpload({ value, onChange, label }: ContentVideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Erreur upload (${res.status})`);
        return;
      }
      if (data.url) onChange(data.url);
      else setError('Réponse invalide du serveur');
    } catch {
      setError('Erreur réseau — vérifiez votre connexion');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {value && (
        <div className="space-y-2">
          <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-black">
            {value.includes('.mp4') || value.includes('/storage/') || value.startsWith('/videos/') ? (
              <video src={value} className="max-h-48 w-full object-contain" controls muted />
            ) : (
              <div className="flex items-center gap-2 p-4 bg-gray-50">
                <Film className="size-5 text-gray-400" />
                <span className="text-sm text-gray-600 truncate">{value}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 className="size-3" />
            Supprimer
          </button>
        </div>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors duration-200 ${
          dragOver
            ? 'border-[#1B0B94] bg-[#1B0B94]/5'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="size-6 animate-spin text-[#1B0B94] mb-2" />
            <span className="text-sm text-gray-500">Upload en cours...</span>
          </>
        ) : (
          <>
            <Upload className="size-6 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">
              Glissez une vidéo ou cliquez pour sélectionner
            </span>
            <span className="text-xs text-gray-400 mt-1">MP4, WebM — max 50 Mo</span>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = '';
        }}
      />

      {/* URL alternative */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setUrlMode(!urlMode)}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          {urlMode ? 'Masquer' : 'Ou coller une URL vidéo'}
        </button>
      </div>
      {urlMode && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... ou /videos/ma-video.mp4"
          className="text-sm"
        />
      )}
    </div>
  );
}
