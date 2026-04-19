'use client';

import { Eye } from 'lucide-react';

interface PreviewButtonProps {
  url: string;
}

export function PreviewButton({ url }: PreviewButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.open(url, '_blank')}
      className="border border-[#1B0B94] text-[#1B0B94] rounded-lg px-4 py-2 text-sm flex items-center gap-2 hover:bg-[#1B0B94]/5 transition-colors"
    >
      <Eye className="size-4" />
      Aperçu
    </button>
  );
}
