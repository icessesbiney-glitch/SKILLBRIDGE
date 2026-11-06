import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// 1. Structural Fallback Guard: Prevents compilation null pointer crashes during Vercel build checks
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'SkillBridge Missing Keys Alert: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set in your hosting environment.'
  );
}

// 2. Base Configuration Object Engine
const clientUrl = supabaseUrl || 'https://supabase.co';
const clientKey = supabaseAnonKey || 'placeholder-anon-key';

// 3. Platform Agnostic Initialization Engine
export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: typeof window !== 'undefined' && window.location ? true : false,
  },
});
