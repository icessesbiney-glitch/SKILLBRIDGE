import { NextResponse, type NextRequest } from 'next/server';

import { updateSession } from './utils/supabase/middleware';

const protectedPrefixes = ['/dashboard', '/team', '/roadmap'];

const isProtectedPath = (pathname: string) =>
  protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export async function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  );

  if (!isConfigured) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  if (!user) {
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/team/:path*', '/roadmap/:path*'],
};
