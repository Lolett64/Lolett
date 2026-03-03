'use client';

import { Mail } from 'lucide-react';
import type { EmailSettings } from './types';
import { formatDate } from './types';

interface EmailListViewProps {
  emails: EmailSettings[];
  loading: boolean;
  onSelect: (email: EmailSettings) => void;
}

export function EmailListView({ emails, loading, onSelect }: EmailListViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-newsreader)] text-3xl font-light text-[#1a1510]">Emails transactionnels</h1>
        <p className="mt-1 text-sm text-[#B89547]">G&eacute;rez le contenu de vos emails automatiques</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl bg-[#FDF5E6] border border-gray-200/50" />
          ))}
        </div>
      ) : emails.length === 0 ? (
        <div className="rounded-xl bg-white border border-gray-200/50 p-12 text-center">
          <Mail className="mx-auto size-10 text-[#1a1510]/20 mb-3" />
          <p className="text-[#1a1510]/40">Aucun template email configur&eacute;</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {emails.map((email) => (
            <button
              key={email.id}
              onClick={() => onSelect(email)}
              className="text-left rounded-xl bg-white border border-gray-200/50 shadow-sm p-5 hover:border-[#B89547]/30 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[#1B0B94]/10 text-[#1B0B94]">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-montserrat)] font-medium text-[#1a1510] group-hover:text-[#1B0B94] transition-colors">
                      {email.label}
                    </h3>
                    <p className="text-sm text-[#1a1510]/50 mt-0.5">{email.subject_template}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-[#1a1510]/30">
                <span>De : {email.from_name}</span>
                {email.updated_at && <span>Mis &agrave; jour le {formatDate(email.updated_at)}</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
