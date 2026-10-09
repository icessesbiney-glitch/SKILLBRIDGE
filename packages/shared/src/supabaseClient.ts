import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
