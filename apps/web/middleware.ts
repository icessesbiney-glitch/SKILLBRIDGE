import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const userRole = user.user_metadata?.role_tier;
    if (userRole !== 'admin_central') return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return response;
}
export const config = { matcher: ['/admin/:path*', '/dashboard/:path*'] };
