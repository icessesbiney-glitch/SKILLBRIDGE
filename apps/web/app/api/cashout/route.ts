import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "../../../utils/supabase/server";

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
    const supabase = createClient(await cookies());
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401, headers: corsHeaders });
    }

    const { data } = await supabase
      .from("wallets")
      .select("amount")
      .eq("user_id", user.id)
      .single();
    const currentAmount = data?.amount ?? 0;
    return NextResponse.json({ data: { amount: currentAmount } }, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ data: { amount: 0 } }, { headers: corsHeaders });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(await cookies());
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401, headers: corsHeaders });
    }

    const { amount } = await req.json();
    const subAmount = parseFloat(amount || "0");

    if (subAmount <= 0) {
      return NextResponse.json({ error: "Invalid transaction amount" }, { status: 400, headers: corsHeaders });
    }

    // Pull down this user's own wallet row only.
    const { data: wallet } = await supabase
      .from("wallets")
      .select("id, amount")
      .eq("user_id", user.id)
      .single();
    const existingBalance = wallet?.amount ?? 0;

    if (subAmount > existingBalance) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400, headers: corsHeaders });
    }

    const nextBalance = Math.max(0, existingBalance - subAmount);

    if (wallet?.id) {
      await supabase.from("wallets").update({ amount: nextBalance }).eq("id", wallet.id).eq("user_id", user.id);
    }

    await supabase.from("transactions").insert([
      {
        user_id: user.id,
        title: "Mobile Wallet Cashout Request",
        amount: subAmount,
        type: "withdrawal",
        status: "success",
      },
    ]);

    return NextResponse.json({ success: true, balance: nextBalance }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
