import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const updateSession = async (request: NextRequest) => {
  // 1. Build defensive baseline fallbacks for your deployment server compilation pass
  const clientUrl = supabaseUrl || "https://placeholder-project.supabase.co";
  const clientKey = supabaseKey || "placeholder-anon-key";

  // Create the baseline response stream
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Initialize your secure server-side workspace middleware client
  const supabase = createServerClient(
    clientUrl,
    clientKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mutate the active request streams to pass current state downward smoothly
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({ name, value, ...options })
          );

          // Update the response headers while preserving existing request definitions
          supabaseResponse = NextResponse.next({
            request,
          });

          // Commit the updated cookies cleanly onto the final client viewport response channel
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    },
  );

  try {
    // 3. Securely validate the active user token directly from the database server instance
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 4. Return both the verified user payload and the synchronized header response stream
    return { response: supabaseResponse, user };
  } catch (error) {
    console.error("Supabase middleware token resolution error:", error);
    return { response: supabaseResponse, user: null };
  }
};
