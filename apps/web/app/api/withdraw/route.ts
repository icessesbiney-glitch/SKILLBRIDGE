import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profileId, requestedAmountCents, payoutMethod } = body;

    if (!profileId || !requestedAmountCents || !payoutMethod) {
      return NextResponse.json({ error: "Incomplete withdrawal transaction parameters." }, { status: 400 });
    }

    if (requestedAmountCents < 5000) {
      return NextResponse.json({ error: "Minimum withdrawal threshold is 50 GHS." }, { status: 400 });
    }

    const { data, error: rpcError } = await supabase.rpc("execute_wallet_withdrawal", {
      target_profile_id: profileId,
      requested_amount_cents: requestedAmountCents,
      payment_reference: "WITHDRAW_TXN_" + Date.now()
    });

    if (rpcError || !data?.success) {
      return NextResponse.json({ error: data?.error || rpcError?.message || "Ledger adjustment rejected." }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Withdrawal processed and logged atomically.",
      details: data
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}