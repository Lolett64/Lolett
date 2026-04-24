import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

const getSessionMock = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: getSessionMock,
      updateUser: vi.fn(),
    },
  }),
}));

describe('ResetPasswordForm', () => {
  it('shows invalid-link error when no session is present', async () => {
    getSessionMock.mockResolvedValueOnce({ data: { session: null } });
    render(<ResetPasswordForm />);
    await waitFor(() => {
      expect(
        screen.getByText(/lien expiré ou invalide/i),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('link', { name: /demander un nouveau lien/i }),
    ).toHaveAttribute('href', '/mot-de-passe-oublie');
  });

  it('renders the password form when a valid session is present', async () => {
    getSessionMock.mockResolvedValueOnce({
      data: { session: { user: { id: 'u1' } } },
    });
    render(<ResetPasswordForm />);
    await waitFor(() => {
      expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/confirmer le mot de passe/i)).toBeInTheDocument();
  });
});
