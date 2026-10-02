import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // The service role key is preferred so the wallet RPC can be locked down to the server
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!secretKey || !supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
    }

    // Paystack signs the raw body with HMAC SHA512 using the secret key
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";
    const expected = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");

    const valid =
      signature.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    if (body.event === "charge.success" && body.data?.status === "success") {
      const { amount, customer } = body.data;
      const ghsAmount = amount / 100;

      const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
      const { error } = await supabase.rpc("increment_wallet_balance", {
        user_email: customer.email,
        amount_to_add: ghsAmount,
      });
      if (error) throw error;
      console.log(`Paystack charge ${body.data.reference} credited to wallet`);
    }
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
