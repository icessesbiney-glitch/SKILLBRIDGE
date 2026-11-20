import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isDeferredApi = [
    "/api/gps",
    "/api/dispatch",
    "/api/delivery/dispatch",
    "/api/rider/telemetry",
    "/api/orders/create",
  ].some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isDeferredApi) {
    return NextResponse.json(
      { error: "Driver and delivery functionality is deferred until 2029.", code: "sector_deferred" },
      { status: 410 },
    );
  }

  if (pathname === "/rider" || pathname.startsWith("/rider/") || pathname === "/admin/gps") {
    return NextResponse.rewrite(new URL("/deferred", request.url));
  }

  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const isAdminRoute = pathname.startsWith("/admin");
  const isSessionRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/roadmap");

  if (
    (isAdminRoute || isSessionRoute) &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY))
  ) {
    const authUrl = new URL("/auth", request.url);
    authUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(authUrl);
  }

  const { response, user, supabase } = await updateSession(request);

  if (isAdminRoute) {
    if (!user) {
      const authUrl = new URL("/auth", request.url);
      authUrl.searchParams.set("next", nextPath);
      return NextResponse.redirect(authUrl);
    }

    // user_metadata is user-editable; the role must come from the profiles table.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role_tier")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role_tier !== "admin_central") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (
    isSessionRoute &&
    !user
  ) {
    const authUrl = new URL("/auth", request.url);
    authUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(authUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/roadmap/:path*",
    "/rider/:path*",
    "/api/gps/:path*",
    "/api/dispatch/:path*",
    "/api/delivery/dispatch/:path*",
    "/api/rider/telemetry/:path*",
    "/api/orders/create/:path*",
  ],
};
