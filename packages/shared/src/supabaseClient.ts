import { createClient } from '@supabase/supabase-js';

const configuredUrls = [
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_URL,
];

const supabaseUrl =
  configuredUrls
    .map((value) => value?.trim())
    .find((value) => {
      if (!value) return false;

      try {
        const parsed = new URL(value);
        return (
          (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
          Boolean(parsed.hostname)
        );
      } catch {
        return false;
      }
    }) || 'https://placeholder-project.supabase.co';

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: typeof window !== 'undefined',
  },
});
