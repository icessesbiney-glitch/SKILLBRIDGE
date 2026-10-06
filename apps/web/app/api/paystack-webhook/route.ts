import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!secretKey || !supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Server infrastructure parameters are missing." }, { status: 500 });
    }

    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing verification headers." }, { status: 401 });
    }

    const rawBody = await req.text();
    const expectedSignature = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Signature verification failed." }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    if (body.event === "charge.success") {
      const payment = body.data;
      const reference = payment.reference;
      const amount = Number(payment.amount || 0) / 100;

      if (!reference) {
        return NextResponse.json({ error: "Missing reference tracker parameter." }, { status: 400 });
      }

      const { data: txRecord, error: lookError } = await supabase
        .from("paystack_transactions")
        .select("id, user_id, status")
        .eq("reference", reference)
        .maybeSingle();

      if (lookError || !txRecord) {
        return NextResponse.json({ error: "Payment lookup target unresolvable." }, { status: 200 });
      }

      if (txRecord.status === "success") {
        return NextResponse.json({ received: true, info: "Duplicate notification ignored." });
      }

      // Step 1: Update transaction status
      await supabase
        .from("paystack_transactions")
        .update({ status: "success", updated_at: new Date().toISOString() })
        .eq("id", txRecord.id);

      // Step 2: Fetch current active platform wallet balance row matching the target user
      const { data: wallet } = await supabase
        .from("platform_wallets")
        .select("id, available_balance")
        .eq("user_id", txRecord.user_id)
        .single();

      if (wallet) {
        const nextBalance = wallet.available_balance + amount;
        await supabase
          .from("platform_wallets")
          .update({ available_balance: nextBalance, updated_at: new Date().toISOString() })
          .eq("id", wallet.id);
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed cleanly." });
  } catch (error) {
    return NextResponse.json({ error: "Internal payment handler runtime crash." }, { status: 500 });
  }
}