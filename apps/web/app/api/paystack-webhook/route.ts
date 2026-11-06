import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminClient } from "../_lib/auth";

function validSignature(raw: string, signature: string | null): boolean {
  // Paystack signs webhooks with the account secret key.
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    if (!validSignature(rawBody, req.headers.get("x-paystack-signature"))) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }
    const supabase = adminClient();
    if (!supabase) return NextResponse.json({ error: "Server is not configured." }, { status: 500 });

    const event = JSON.parse(rawBody);
    const data = event.data ?? {};

    if (event.event === "charge.success" && data.reference) {
      const { error } = await supabase.rpc("settle_paystack_payment", {
        payment_reference: data.reference,
        paid_pesewas: data.amount,
        paid_currency: data.currency,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (event.event === "transfer.failed" || event.event === "transfer.reversed") {
      const { data: entry } = await supabase
        .from("ledger_entries")
        .select("wallet_id, platform_wallets(profile_id)")
        .eq("reference_id", data.reference)
        .maybeSingle();
      const wallet = entry?.platform_wallets as unknown as { profile_id: string } | null;
      if (wallet?.profile_id) {
        const { error } = await supabase.rpc("reverse_wallet_withdrawal", {
          target_profile_id: wallet.profile_id,
          returned_amount_cents: data.amount,
          failed_reference: data.reference,
        });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ processed: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
