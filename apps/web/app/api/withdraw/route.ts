import { getTelecomBankCode } from "../../../utils/telecomMapper";
import { NextResponse } from "next/server";
import { adminClient, authenticate } from "../_lib/auth";

export async function POST(req: Request) {
  try {
    const auth = await authenticate(req);
    if ("error" in auth) return auth.error;
    const supabase = adminClient();
    if (!supabase) return NextResponse.json({ error: "Server is not configured." }, { status: 500 });

    const body = await req.json();
    const { requestedAmountCents, payoutMethod } = body;
    const profileId = auth.user.id;

    if (!Number.isInteger(requestedAmountCents) || !payoutMethod) {
      return NextResponse.json({ error: "Incomplete withdrawal transaction parameters." }, { status: 400 });
    }

    if (requestedAmountCents < 5000) {
      return NextResponse.json({ error: "Minimum withdrawal threshold is 50 GHS." }, { status: 400 });
    }

    const { data, error: rpcError } = await supabase.rpc("execute_wallet_withdrawal", {
      target_profile_id: profileId,
      requested_amount_cents: requestedAmountCents,
      payment_reference: "WITHDRAW_" + crypto.randomUUID()
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