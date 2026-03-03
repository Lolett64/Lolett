'use client';

import { Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EmailTestModalProps {
  testEmail: string;
  onTestEmailChange: (v: string) => void;
  testResult: { ok: boolean; msg: string } | null;
  sendingTest: boolean;
  onSend: () => void;
  onClose: () => void;
}

export function EmailTestModal({
  testEmail,
  onTestEmailChange,
  testResult,
  sendingTest,
  onSend,
  onClose,
}: EmailTestModalProps) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-xl bg-white shadow-xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-medium text-gray-900">Envoyer un email de test</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => onTestEmailChange(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          {testResult && (
            <p className={`text-sm font-medium ${testResult.ok ? 'text-green-600' : 'text-red-600'}`}>
              {testResult.msg}
            </p>
          )}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onSend}
              disabled={sendingTest || !testEmail}
              className="flex items-center gap-2 rounded-lg bg-[#1B0B94] px-4 py-2 text-sm font-medium text-white hover:bg-[#130970] disabled:opacity-50 transition-colors"
            >
              {sendingTest ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
