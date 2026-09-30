import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://lhpdxsnsepvlhwkwsvel.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder"
);

export async function GET() {
  try {
    const { error } = await supabase.rpc("exec_sql", {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email TEXT NOT NULL,
          amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
          status TEXT DEFAULT "pending" CHECK (status IN ("pending", "processing", "completed", "failed")),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone("utc"::text, now()) NOT NULL
        );

        CREATE OR REPLACE FUNCTION public.process_automated_withdrawal_ledger()
        RETURNS TRIGGER AS $$
        DECLARE
          current_balance NUMERIC(10, 2);
        BEGIN
          SELECT wallet_balance INTO current_balance
          FROM public.user_profiles
          WHERE email = NEW.email
          FOR UPDATE;

          IF current_balance IS NULL OR current_balance < NEW.amount THEN
            RAISE EXCEPTION "Insufficient funds balance.";
          END IF;

          UPDATE public.user_profiles
          SET wallet_balance = wallet_balance - NEW.amount
          WHERE email = NEW.email;

          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        DROP TRIGGER IF EXISTS trigger_withdrawal_ledger_sync ON public.withdrawal_requests;
        CREATE TRIGGER trigger_withdrawal_ledger_sync
        BEFORE INSERT ON public.withdrawal_requests
        FOR EACH ROW
        EXECUTE FUNCTION public.process_automated_withdrawal_ledger();
      `
    });

    if (error) throw error;
    return NextResponse.json({ migration: "completed", ledger_logic: "active" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
