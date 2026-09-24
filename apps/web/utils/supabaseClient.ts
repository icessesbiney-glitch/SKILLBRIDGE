import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// 1. Structural Fallback Guard: Prevents compilation null pointer crashes during Vercel build checks
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SkillBridge Missing Keys Alert: Mandatory environmental parameters NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be populated inside your hosting environment dashboard.'
    );
  }
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
