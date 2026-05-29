'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { HistoryDrawer } from '@/components/admin/HistoryDrawer';
import { useEmailEditor } from '@/components/admin/emails/useEmailEditor';
import { EmailListView } from '@/components/admin/emails/EmailListView';
import { EmailFormSection } from '@/components/admin/emails/EmailFormSection';
import { EmailPreviewPanel } from '@/components/admin/emails/EmailPreviewPanel';
import { EmailTestModal } from '@/components/admin/emails/EmailTestModal';
import { NewsletterSubscribersView } from '@/components/admin/newsletter/NewsletterSubscribersView';

type Tab = 'templates' | 'subscribers';

export default function AdminEmailsPage() {
  const editor = useEmailEditor();
  const [tab, setTab] = useState<Tab>('templates');

  // ---------- EDIT VIEW (template ouvert) ----------
  if (editor.selectedId && editor.formData && editor.selected) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={editor.goBack}
            className="flex items-center gap-1.5 text-sm text-[#1a1510]/50 hover:text-[#1B0B94] transition-colors"
          >
            <ArrowLeft className="size-4" />
            Retour aux emails
          </button>

          <div className="flex items-center gap-2">
            {editor.savedFlash && (
              <span className="text-sm text-green-600 font-medium animate-fade-in">Sauvegard&eacute; &#10003;</span>
            )}
            {editor.isDirty && !editor.savedFlash && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                Modifi&eacute;
              </span>
            )}
          </div>
        </div>

        <div>
          <h1 className="font-[family-name:var(--font-newsreader)] text-3xl font-light text-[#1a1510]">{editor.selected.label}</h1>
          <p className="text-sm text-[#B89547] mt-1">Template : {editor.selected.template_key}</p>
        </div>

        <div className="lg:grid lg:grid-cols-2 gap-6">
          <EmailFormSection
            selected={editor.selected}
            formData={editor.formData}
            saving={editor.saving}
            isDirty={editor.isDirty}
            onUpdateField={editor.updateField}
            onUpdateExtraParam={editor.updateExtraParam}
            onSave={editor.handleSave}
            onOpenTestModal={editor.openTestModal}
            onOpenHistory={() => editor.setHistoryOpen(true)}
          />

          <EmailPreviewPanel
            previewHtml={editor.previewHtml}
            previewLoading={editor.previewLoading}
          />
        </div>

        {editor.testModal && (
          <EmailTestModal
            testEmail={editor.testEmail}
            onTestEmailChange={editor.setTestEmail}
            testResult={editor.testResult}
            sendingTest={editor.sendingTest}
            onSend={editor.handleSendTest}
            onClose={() => editor.setTestModal(false)}
          />
        )}

        <HistoryDrawer
          open={editor.historyOpen}
          onClose={() => editor.setHistoryOpen(false)}
          tableName="email_settings"
          recordId={editor.selectedId}
          onRestore={() => {
            editor.fetchEmails();
            if (editor.selected) editor.selectTemplate(editor.selected);
          }}
        />
      </div>
    );
  }

  // ---------- LIST VIEW avec tabs ----------
  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg bg-white border border-gray-200 p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab('templates')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === 'templates'
              ? 'bg-[#1B0B94] text-white'
              : 'text-[#1a1510]/60 hover:text-[#1a1510]'
          }`}
        >
          Templates email
        </button>
        <button
          type="button"
          onClick={() => setTab('subscribers')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === 'subscribers'
              ? 'bg-[#1B0B94] text-white'
              : 'text-[#1a1510]/60 hover:text-[#1a1510]'
          }`}
        >
          Inscrits newsletter
        </button>
      </div>

      {tab === 'templates' ? (
        <EmailListView
          emails={editor.emails}
          loading={editor.loading}
          onSelect={editor.selectTemplate}
        />
      ) : (
        <NewsletterSubscribersView />
      )}
    </div>
  );
}
