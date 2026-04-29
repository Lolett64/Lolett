import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { readAdminCookieFromHeader, verifyAdminToken } from '@/lib/admin/token';

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith('/api/admin') &&
    !pathname.startsWith('/api/admin/auth/login') &&
    !pathname.startsWith('/api/admin/auth/logout')
  ) {
    const cookieValue = readAdminCookieFromHeader(request.headers.get('cookie'));
    const isAuth = cookieValue ? await verifyAdminToken(cookieValue) : false;
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const protectedPaths = ['/compte'];
  const isProtected = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/connexion';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Admin routes are protected by their own password-based auth (lib/admin/auth.ts)
  // No Supabase auth check needed here — the admin layout handles redirection to /admin-login

  const authPaths = ['/connexion', '/inscription'];
  const isAuthPage = authPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/compte';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
