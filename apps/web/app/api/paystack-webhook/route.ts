import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Authenticate Request Origin dynamically via local/cloud system environment variables safely
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_WEBHOOK_SECRET || "")
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Unauthorized webhook signature payload mismatch." }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "transfer.success") {
      const { reference } = event.data;

      const { data, error } = await supabase
        .from("wallet_transactions")
        .update({ status: "success", updated_at: new Date().toISOString() })
        .eq("reference_id", reference)
        .select();
        
      console.log("[DB OPERATION] Webhook match results:", { data, error });
    }

    if (event.event === "transfer.failed" || event.event === "transfer.reversed") {
      const { reference, amount } = event.data;

      const { data: txn } = await supabase
        .from("wallet_transactions")
        .select("profile_id")
        .eq("reference_id", reference)
        .single();

      if (txn) {
        await supabase.rpc("reverse_wallet_withdrawal", {
          target_profile_id: txn.profile_id,
          returned_amount_cents: amount,
          failed_reference: reference
        });
      }
    }

    return NextResponse.json({ processed: true }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
