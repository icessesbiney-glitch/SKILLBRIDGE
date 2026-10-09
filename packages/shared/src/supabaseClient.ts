import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://supabase.co";
const supabaseAnonKey = "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
