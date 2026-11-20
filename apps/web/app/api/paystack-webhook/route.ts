import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminClient } from "../_lib/auth";
import { readRequestBody, RequestBodyTooLargeError } from "../_lib/request-body";

function validSignature(raw: Uint8Array, signature: string | null): boolean {
  // Paystack signs webhooks with the account secret key.
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature || !/^[a-f\d]{128}$/i.test(signature)) return false;
  const a = crypto.createHmac("sha512", secret).update(raw).digest();
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  try {
    let rawBody: Uint8Array;
    try {
      rawBody = await readRequestBody(req, 1_000_000);
    } catch (error) {
      if (error instanceof RequestBodyTooLargeError) {
        return NextResponse.json({ error: "Webhook payload is too large." }, { status: 413 });
      }
      throw error;
    }
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: "Webhook service is not configured." }, { status: 503 });
    }
    if (!validSignature(rawBody, req.headers.get("x-paystack-signature"))) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }
    let event: unknown;
    try {
      event = JSON.parse(new TextDecoder().decode(rawBody));
    } catch {
      return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
    }
    if (!event || typeof event !== "object" || Array.isArray(event)) {
      return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
    }
    const eventData = event as { event?: unknown; data?: unknown };
    if (!eventData.data || typeof eventData.data !== "object" || Array.isArray(eventData.data)) {
      return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
    }
    const data = eventData.data as {
      reference?: unknown;
      amount?: unknown;
      currency?: unknown;
    };

    const supabase = adminClient();
    if (!supabase) return NextResponse.json({ error: "Server is not configured." }, { status: 500 });

    if (eventData.event === "charge.success") {
      if (
        typeof data.reference !== "string" ||
        !Number.isSafeInteger(data.amount) ||
        typeof data.currency !== "string"
      ) {
        return NextResponse.json({ error: "Invalid payment event." }, { status: 400 });
      }

      const { data: settlement, error } = await supabase.rpc("settle_paystack_payment", {
        payment_reference: data.reference,
        paid_pesewas: data.amount,
        paid_currency: data.currency,
      });
      if (error || !settlement?.success) {
        console.error("Paystack payment settlement failed.", error ?? settlement);
        return NextResponse.json({ error: "Payment settlement is pending review." }, { status: 500 });
      }
    }

    if (eventData.event === "transfer.success") {
      if (typeof data.reference !== "string") {
        return NextResponse.json({ error: "Invalid transfer event." }, { status: 400 });
      }
      if (!data.reference.startsWith("cashout_")) {
        return NextResponse.json({ processed: true }, { status: 200 });
      }

      const now = new Date().toISOString();
      const { data: transfer, error: transferError } = await supabase
        .from("paystack_transfers")
        .update({ status: "success", updated_at: now, completed_at: now })
        .eq("reference", data.reference)
        .in("status", ["initialized", "pending"])
        .select("reference")
        .maybeSingle();
      if (transferError) {
        console.error("Unable to record successful Paystack cashout.", transferError);
        return NextResponse.json({ error: "Cashout status update is pending review." }, { status: 500 });
      }
      if (!transfer) {
        const { data: existing, error: existingError } = await supabase
          .from("paystack_transfers")
          .select("status")
          .eq("reference", data.reference)
          .maybeSingle();
        if (existingError || existing?.status !== "success") {
          console.error("Unable to find a pending cashout for the success event.", existingError);
          return NextResponse.json({ error: "Cashout status update is pending review." }, { status: 500 });
        }
      }
    }

    if (eventData.event === "transfer.failed" || eventData.event === "transfer.reversed") {
      if (typeof data.reference !== "string") {
        return NextResponse.json({ error: "Invalid transfer event." }, { status: 400 });
      }
      if (!data.reference.startsWith("cashout_")) {
        return NextResponse.json({ processed: true }, { status: 200 });
      }
      if (!Number.isSafeInteger(data.amount) || (data.amount as number) <= 0) {
        return NextResponse.json({ error: "Invalid transfer event." }, { status: 400 });
      }

      const { data: entry, error: entryError } = await supabase
        .from("ledger_entries")
        .select("wallet_id, platform_wallets(profile_id)")
        .eq("reference_id", data.reference)
        .eq("entry_type", "withdrawal")
        .maybeSingle();
      if (entryError || !entry) {
        console.error("Unable to find the failed cashout ledger entry.", entryError);
        return NextResponse.json({ error: "Cashout reversal is pending review." }, { status: 500 });
      }
      const wallet = entry?.platform_wallets as unknown as { profile_id: string } | null;
      if (!wallet?.profile_id) {
        console.error("Failed cashout ledger entry has no associated wallet.", data.reference);
        return NextResponse.json({ error: "Cashout reversal is pending review." }, { status: 500 });
      }
      const { data: reversal, error } = await supabase.rpc("reverse_wallet_withdrawal", {
        target_profile_id: wallet.profile_id,
        returned_amount_cents: data.amount,
        failed_reference: data.reference,
        allow_success_reversal: eventData.event === "transfer.reversed",
      });
      if (error || !reversal?.success) {
        console.error("Paystack cashout reversal failed.", error ?? reversal);
        return NextResponse.json({ error: "Cashout reversal is pending review." }, { status: 500 });
      }
    }

    return NextResponse.json({ processed: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected Paystack webhook processing failure.", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
