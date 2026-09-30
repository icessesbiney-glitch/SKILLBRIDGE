import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Uses the elevated service role key to securely overwrite root database access settings
const supabase = createClient(
  "https://supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder"
);

export async function GET() {
  try {
    const { error } = await supabase.rpc("exec_sql", {
      sql_query: `
        -- 1. Enable Row Level Security policies on your financial ledger tables
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

        -- 2. Create strict security policies for the User Profiles ledger
        DROP POLICY IF EXISTS "Allow authenticated users to read their own profile row" ON public.user_profiles;
        CREATE POLICY "Allow authenticated users to read their own profile row" 
        ON public.user_profiles FOR SELECT 
        USING (auth.jwt() ->> "email" = email);

        DROP POLICY IF EXISTS "Restrict profile balance updates to system service worker rules" ON public.user_profiles;
        CREATE POLICY "Restrict profile balance updates to system service worker rules" 
        ON public.user_profiles FOR UPDATE 
        USING (false); -- Blocks all frontend balance updates entirely

        -- 3. Create strict security policies for the Withdrawal Requests grid
        DROP POLICY IF EXISTS "Allow authenticated users to create withdrawal request lines" ON public.withdrawal_requests;
        CREATE POLICY "Allow authenticated users to create withdrawal request lines" 
        ON public.withdrawal_requests FOR INSERT 
        WITH CHECK (auth.jwt() ->> "email" = email);

        DROP POLICY IF EXISTS "Allow authenticated users to audit their own cashout logs" ON public.withdrawal_requests;
        CREATE POLICY "Allow authenticated users to audit their own cashout logs" 
        ON public.withdrawal_requests FOR SELECT 
        USING (auth.jwt() ->> "email" = email);
      `
    });

    if (error) throw error;
    return NextResponse.json({ migration: "secured", rls_policies: "active" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
