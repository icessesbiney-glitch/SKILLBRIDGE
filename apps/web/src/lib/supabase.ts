import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aolfuonsuaeoitumuvqc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_nLN657ZMe6wupW9HNdm6DQ_44_bZOjE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getAdminSupabase = () => {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
    auth: { persistSession: false }
  });
};
