import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lhpdxsnsepvlhwkwsvel.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-dodo-signature") || "";
    const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET || "whsec_llIBNX4Ll0HXmUhARTZ398HFvE/Hg8Sj";

    if (!signature) {
      return NextResponse.json({ received: true, simulated: true }, { status: 200 });
    }

    const computedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (signature !== computedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    if (event === "payment.succeeded" || payload.type === "payment.succeeded") {
      const userEmail = data?.customer?.email || "test@acme.com";
      await supabase.from("user_profiles").update({
        verification_status: "approved",
        wallet_balance: 400.00
      }).eq("email", userEmail);
    }

    return NextResponse.json({ received: true, processed: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
