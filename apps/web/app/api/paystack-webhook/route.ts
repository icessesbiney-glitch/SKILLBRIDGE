import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secretKey = process.env.PAYSTACK_LIVE_SECRET_KEY || "";

    if (!signature || !secretKey) {
      return NextResponse.json({ error: "Missing configuration" }, { status: 401 });
    }

    const computedHash = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    if (computedHash !== signature) {
      return NextResponse.json({ error: "Signature mismatch" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    if (event.event === "charge.success") {
      const { reference, amount, customer } = event.data;
      
      console.log(`[PAYSTACK LIVE] Ingesting validated transaction: ${reference}`);

      // Invoke the atomic stored procedure to safely increment user wallet balance sheets
      const { data, error } = await supabase.rpc("increment_wallet_balance", {
        target_user_email: customer.email,
        amount_cents_to_add: amount,
        transaction_reference_id: reference
      });

      if (error) {
        console.error("[LEDGER UPDATE ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "Handshake verified" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
