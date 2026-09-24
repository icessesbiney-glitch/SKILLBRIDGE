import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = () => {
  // Defensive string parameters to protect your static optimization builds from freezing up
  const clientUrl = supabaseUrl || "https://supabase.co";
  const clientKey = supabaseKey || "placeholder-anon-key";

  return createBrowserClient(
    clientUrl,
    clientKey
  );
};
