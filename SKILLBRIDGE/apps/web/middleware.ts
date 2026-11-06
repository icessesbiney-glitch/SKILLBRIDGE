import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const protectedRoute =
    request.nextUrl.pathname === "/roadmap" ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/tasks") ||
    request.nextUrl.pathname.startsWith("/team") ||
    request.nextUrl.pathname.startsWith("/rider");

  if (!protectedRoute) return NextResponse.next();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.redirect(new URL(`/auth?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`, request.url));
  }

  const { response, user } = await updateSession(request);
  if (!user) {
    return NextResponse.redirect(new URL(`/auth?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`, request.url));
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    const userRole = user.user_metadata?.role_tier;
    if (userRole !== "admin_central") return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return response;
}

export const config = { matcher: ["/roadmap", "/dashboard/:path*", "/admin/:path*", "/tasks/:path*", "/team/:path*", "/rider/:path*"] };
