import { describe, it, expect } from 'vitest';
import { escapeHtml } from '@/lib/utils/escape-html';

describe('escapeHtml', () => {
  it('escapes < and > to entities', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
  });

  it('escapes & to &amp; first (so existing entities are not double-escaped)', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('escapes double and single quotes', () => {
    expect(escapeHtml(`"hello" 'world'`)).toBe('&quot;hello&quot; &#39;world&#39;');
  });

  it('preserves plain text unchanged', () => {
    expect(escapeHtml('Bonjour Lola')).toBe('Bonjour Lola');
  });

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('escapes onerror XSS payload', () => {
    const payload = '<img src=x onerror="alert(1)">';
    const result = escapeHtml(payload);
    // Le payload ne doit plus former de balise HTML valide
    expect(result).not.toContain('<img');
    expect(result).not.toContain('">');
    // Les caractères dangereux doivent être encodés
    expect(result).toContain('&lt;img');
    expect(result).toContain('&quot;');
    expect(result).toContain('&gt;');
  });
});
