'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { EmailSettings, FormData } from './types';

export function useEmailEditor() {
  const [emails, setEmails] = useState<EmailSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testModal, setTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = emails.find((e) => e.id === selectedId) ?? null;

  // ---------- Fetch list ----------
  const fetchEmails = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/emails');
      const data = await res.json();
      setEmails(data.emails ?? []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // ---------- Preview ----------
  const fetchPreview = async (templateKey: string, overrides: FormData) => {
    setPreviewLoading(true);
    try {
      const res = await fetch('/api/admin/emails/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_key: templateKey, overrides }),
      });
      const data = await res.json();
      setPreviewHtml(data.html ?? '');
    } catch {
      setPreviewHtml('<p style="color:red;padding:1rem;">Erreur de prévisualisation</p>');
    } finally {
      setPreviewLoading(false);
    }
  };

  const schedulePreview = (fd: FormData) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (selected) fetchPreview(selected.template_key, fd);
    }, 800);
  };

  // ---------- Select a template ----------
  const selectTemplate = (email: EmailSettings) => {
    setSelectedId(email.id);
    const fd: FormData = {
      from_name: email.from_name,
      from_email: email.from_email,
      subject_template: email.subject_template,
      greeting: email.greeting,
      body_text: email.body_text,
      cta_text: email.cta_text,
      cta_url: email.cta_url,
      signoff: email.signoff,
      extra_params: email.extra_params ?? {},
    };
    setFormData(fd);
    setOriginalData(fd);
    setPreviewHtml('');
    setSavedFlash(false);
    fetchPreview(email.template_key, fd);
  };

  // ---------- Form helpers ----------
  const updateField = (key: keyof FormData, value: string) => {
    if (!formData) return;
    const next = { ...formData, [key]: value };
    setFormData(next);
    schedulePreview(next);
  };

  const updateExtraParam = (key: string, value: string | number) => {
    if (!formData) return;
    const next = { ...formData, extra_params: { ...formData.extra_params, [key]: value } };
    setFormData(next);
    schedulePreview(next);
  };

  const isDirty = formData && originalData && JSON.stringify(formData) !== JSON.stringify(originalData);

  // ---------- Save ----------
  const handleSave = async () => {
    if (!selectedId || !formData) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/emails/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updated = await res.json();
        setEmails((prev) => prev.map((e) => (e.id === selectedId ? { ...e, ...updated } : e)));
        setOriginalData({ ...formData });
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2000);
      }
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  // ---------- Test email ----------
  const handleSendTest = async () => {
    if (!selected || !testEmail) return;
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/emails/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_key: selected.template_key, recipient: testEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ ok: true, msg: 'Email envoy\u00e9 \u2713' });
        setTimeout(() => {
          setTestModal(false);
          setTestResult(null);
        }, 1500);
      } else {
        setTestResult({ ok: false, msg: data.error || 'Erreur' });
      }
    } catch {
      setTestResult({ ok: false, msg: 'Erreur r\u00e9seau' });
    } finally {
      setSendingTest(false);
    }
  };

  const goBack = () => {
    setSelectedId(null);
    setFormData(null);
  };

  const openTestModal = () => {
    setTestModal(true);
    setTestEmail('');
    setTestResult(null);
  };

  return {
    emails,
    loading,
    selectedId,
    selected,
    formData,
    previewHtml,
    previewLoading,
    saving,
    savedFlash,
    isDirty,
    sendingTest,
    testModal,
    setTestModal,
    testEmail,
    setTestEmail,
    testResult,
    historyOpen,
    setHistoryOpen,
    selectTemplate,
    updateField,
    updateExtraParam,
    handleSave,
    handleSendTest,
    goBack,
    openTestModal,
    fetchEmails,
  };
}
