import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const authUrl = new URL("/auth", request.url);
      authUrl.searchParams.set("next", nextPath);
      return NextResponse.redirect(authUrl);
    }

    const userRole = user.user_metadata?.role_tier;
    if (userRole !== "admin_central") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/roadmap")) &&
    !user
  ) {
    const authUrl = new URL("/auth", request.url);
    authUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(authUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/roadmap/:path*"],
};
