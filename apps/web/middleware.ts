import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

const isSupabaseConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  );

const isPublicPath = (pathname: string) =>
  pathname === "/" ||
  pathname === "/auth" ||
  pathname.startsWith("/auth/") ||
  pathname === "/api" ||
  pathname.startsWith("/api/") ||
  pathname === "/_next" ||
  pathname.startsWith("/_next/") ||
  pathname === "/favicon.ico" ||
  /\.[^/]+$/.test(pathname);

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!isSupabaseConfigured()) {
    const destination = new URL("/auth", request.url);
    destination.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(destination);
  }

  const { response, user } = await updateSession(request);

  if (!user) {
    const destination = new URL("/auth", request.url);
    destination.searchParams.set("next", `${pathname}${search}`);

    const redirectResponse = NextResponse.redirect(destination);

    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
