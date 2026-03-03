'use client';

import { Loader2 } from 'lucide-react';

interface EmailPreviewPanelProps {
  previewHtml: string;
  previewLoading: boolean;
}

export function EmailPreviewPanel({ previewHtml, previewLoading }: EmailPreviewPanelProps) {
  return (
    <div className="mt-6 lg:mt-0">
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-medium text-gray-700">Aper&ccedil;u</p>
        </div>
        <div className="relative" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {previewLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="size-4 animate-spin" />
                Chargement...
              </div>
            </div>
          )}
          {previewHtml ? (
            <iframe
              srcDoc={previewHtml}
              sandbox=""
              className="w-full border-0"
              style={{ minHeight: '500px', height: '65vh' }}
              title="Aper\u00e7u email"
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-sm text-gray-400">
              Chargement de l&apos;aper&ccedil;u...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
