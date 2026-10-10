<<<<<<< HEAD
﻿import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://aolfuonsuaeoitumuvqc.supabase.co";
const supabaseAnonKey = "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo";
=======
import { createClient } from "@supabase/supabase-js";

// Placeholder fallbacks keep the Next.js build from crashing when env vars are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "placeholder-anon-key";

>>>>>>> cfc2e2d86a438fc386c68b7927c07fe07b861bb0
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
