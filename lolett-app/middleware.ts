import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Bloquer les pages /test en production
  if (
    request.nextUrl.pathname.startsWith('/test') &&
    process.env.NODE_ENV === 'production'
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/compte/:path*',
    '/checkout/:path*',
    '/panier/:path*',
    '/favoris/:path*',
    '/api/admin/:path*',
    '/test/:path*',
  ],
};
