import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass check instantly if accessing public assets, auth endpoints, or api tracks
  if (
    pathname.startsWith('/auth') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.static || 
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Enforce strict matching strategy for protected layouts
  const protectedPrefixes = ['/dashboard', '/team', '/roadmap'];
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // 3. Fallback routing path configuration
  const loginUrl = new URL('/auth', request.url);
  loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);

  // 4. Verify baseline environment settings safely
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!isConfigured) {
    console.warn('SkillBridge Infrastructure Alert: Supabase environment variables missing inside cluster.');
    return NextResponse.redirect(loginUrl);
  }

  try {
    // 5. Secure session updating with validation wrapper logic
    const sessionResult = await updateSession(request);
    
    if (!sessionResult || !sessionResult.user) {
      return NextResponse.redirect(loginUrl);
    }

    return sessionResult.response || NextResponse.next();
  } catch (error) {
    console.error('SkillBridge Middleware Runtime Catch:', error);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/team/:path*',
    '/roadmap/:path*'
  ],
};
