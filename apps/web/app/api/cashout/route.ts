import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://lhpdxsnsepvlhwkwsvel.supabase.co",
  "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo"
);

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();
    const { data, error } = await supabase
      .from("withdrawal_requests")
      .insert([{ email: "test@acme.com", amount: parseFloat(amount), status: "pending" }])
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("withdrawal_requests")
      .select("id, amount, status, created_at")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
