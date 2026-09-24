import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  // Defensive fallbacks to insulate the Next.js prerender layer from crashing in CI containers
  const clientUrl = supabaseUrl || "https://placeholder-project.supabase.co";
  const clientKey = supabaseKey || "placeholder-anon-key";

  return createServerClient(
    clientUrl,
    clientKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This safely catches and ignores exceptions if middleware refreshes active sessions.
          }
        },
      },
    },
  );
};
