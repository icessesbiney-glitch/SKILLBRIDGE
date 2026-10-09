import { createClient } from "@supabase/supabase-js";

// Hardcoded fallback coordinates unblock the Next.js compiler from throwing structural URL validation crashes during builds
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lhpdxsnsepvlhwkwsvel.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
