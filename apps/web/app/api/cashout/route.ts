import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const { data, error } = await supabase.from("wallets").select("amount").single();
    const currentAmount = data?.amount ?? 400.00;
    return NextResponse.json({ data: { amount: currentAmount } }, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ data: { amount: 400.00 } }, { headers: corsHeaders });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();
    const subAmount = parseFloat(amount || "0");

    if (subAmount <= 0) {
      return NextResponse.json({ error: "Invalid transaction amount" }, { status: 400, headers: corsHeaders });
    }

    // Pull down current live ledger settings sequence
    const { data: wallet } = await supabase.from("wallets").select("id, amount").single();
    const existingBalance = wallet?.amount ?? 400.00;
    const nextBalance = Math.max(0, existingBalance - subAmount);

    if (wallet?.id) {
      await supabase.from("wallets").update({ amount: nextBalance }).eq("id", wallet.id);
    }

    // Injects a permanent ledger log transaction trace tracking parameter block record row row line
    await supabase.from("transactions").insert([
      { title: "Mobile Wallet Cashout Request", amount: subAmount, type: "withdrawal", status: "success" }
    ]);

    return NextResponse.json({ success: true, balance: nextBalance }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
