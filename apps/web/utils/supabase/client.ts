import { createClient } from '@supabase/supabase-js';

<<<<<<< HEAD
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aolfuonsuaeoitumuvqc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_nLN657ZMe6wupW9HNdm6DQ_44_bZOjE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
=======
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = () => {
  // Defensive string parameters to protect your static optimization builds from freezing up
  const clientUrl = supabaseUrl || "https://placeholder-project.supabase.co";
  const clientKey = supabaseKey || "placeholder-anon-key";
>>>>>>> cfc2e2d86a438fc386c68b7927c07fe07b861bb0

export const getAdminSupabase = () => {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
    auth: { persistSession: false }
  });
};
