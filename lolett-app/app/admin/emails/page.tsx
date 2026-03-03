'use client';

import { ArrowLeft } from 'lucide-react';
import { HistoryDrawer } from '@/components/admin/HistoryDrawer';
import { useEmailEditor } from '@/components/admin/emails/useEmailEditor';
import { EmailListView } from '@/components/admin/emails/EmailListView';
import { EmailFormSection } from '@/components/admin/emails/EmailFormSection';
import { EmailPreviewPanel } from '@/components/admin/emails/EmailPreviewPanel';
import { EmailTestModal } from '@/components/admin/emails/EmailTestModal';

export default function AdminEmailsPage() {
  const editor = useEmailEditor();

  // ---------- LIST VIEW ----------
  if (!editor.selectedId) {
    return (
      <EmailListView
        emails={editor.emails}
        loading={editor.loading}
        onSelect={editor.selectTemplate}
      />
    );
  }

  // ---------- EDIT VIEW ----------
  if (!editor.formData || !editor.selected) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={editor.goBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B0B94] transition-colors"
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
        <h1 className="font-display text-2xl font-semibold text-gray-900">{editor.selected.label}</h1>
        <p className="text-sm text-gray-500 mt-1">Template : {editor.selected.template_key}</p>
      </div>

      {/* Two-column layout */}
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

      {/* Test email modal */}
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

      {/* History drawer */}
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
