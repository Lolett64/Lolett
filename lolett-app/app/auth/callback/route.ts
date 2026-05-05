import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/compte';
  // Sécurité: n'accepte que les chemins internes. Rejette '//evil.com' qui
  // serait sinon interprété comme protocole-relatif et redirigerait vers
  // un site externe (phishing post-login).
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/compte';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/connexion?error=auth`);
}
