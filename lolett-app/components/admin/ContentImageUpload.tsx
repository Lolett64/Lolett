'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Trash2, Loader2 } from 'lucide-react';

interface ContentImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
}

export function ContentImageUpload({ value, onChange, label }: ContentImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) onChange(data.url);
    } catch {
      // silent
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
        <div className="relative inline-block">
          <img
            src={value}
            alt={label}
            className="max-h-40 rounded-lg object-cover border border-gray-200"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="mt-1 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
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
            ? 'border-[#2418a6] bg-[#2418a6]/5'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-[#2418a6]" />
        ) : (
          <>
            <Upload className="size-6 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">
              Glissez une image ou cliquez pour sélectionner
            </span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
