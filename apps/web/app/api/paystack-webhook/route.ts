import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://supabase.co", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.event === "charge.success") {
      const { amount, customer } = body.data;
      const ghsAmount = amount / 100;
      
      const { data, error } = await supabase.rpc("increment_wallet_balance", { 
        user_email: customer.email, 
        amount_to_add: ghsAmount 
      });
      if (error) throw error;
      console.log("💳 Balance allocated successfully in Supabase via Paystack Callback!");
    }
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}