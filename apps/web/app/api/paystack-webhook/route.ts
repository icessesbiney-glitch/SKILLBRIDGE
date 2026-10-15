import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = request.headers.get("x-paystack-signature");

  if (!secret) {
    return NextResponse.json({ error: "Payment service is not configured." }, { status: 503 });
  }
  if (!signature || !/^[a-f0-9]{128}$/i.test(signature)) {
    return NextResponse.json({ error: "Invalid Paystack signature." }, { status: 401 });
  }

  const rawBody = await request.text();
  const expected = createHmac("sha512", secret).update(rawBody).digest();
  const supplied = Buffer.from(signature, "hex");

  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ error: "Invalid Paystack signature." }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true, ignored: true });
  }

  const reference = event.data?.reference;
  if (!reference) {
    return NextResponse.json({ error: "Payment reference is missing." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Missing server-side Supabase configuration for webhook.");
    return NextResponse.json({ error: "Payment processing is not configured." }, { status: 503 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data: payment, error: lookupError } = await admin
      .from("paystack_transactions")
      .select("user_id,reference,amount,currency,status")
      .eq("reference", reference)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!payment || !payment.user_id) {
      console.error("Unknown Paystack reference:", reference);
      return NextResponse.json({ error: "Payment reference not found." }, { status: 404 });
    }

    if (payment.status === "success") {
      return NextResponse.json({ received: true, processed: true, already_processed: true });
    }

    if (payment.status !== "initialized") {
      return NextResponse.json({ received: true, ignored: true });
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${secret}` },
        cache: "no-store",
      },
    );

    const verification = await verifyResponse.json();
    const verified = verification?.data;

    if (!verifyResponse.ok || !verification?.status || !verified) {
      console.error("Paystack verification request failed for reference:", reference);
      return NextResponse.json({ error: "Could not verify payment." }, { status: 502 });
    }

    const expectedPesewas = Math.round(Number(payment.amount) * 100);
    if (
      verified.status !== "success" ||
      !Number.isSafeInteger(verified.id) ||
      verified.id <= 0 ||
      verified.reference !== reference ||
      verified.currency !== "GHS" ||
      !Number.isSafeInteger(expectedPesewas) ||
      verified.amount !== expectedPesewas
    ) {
      console.error("Paystack verification mismatch for reference:", reference);
      return NextResponse.json({ error: "Payment verification did not match the saved transaction." }, { status: 400 });
    }

    const { data: creditResult, error: creditError } = await admin.rpc(
      "credit_paystack_wallet",
      {
        p_reference: reference,
        p_paystack_transaction_id: verified.id,
        p_amount: Number(payment.amount),
        p_currency: verified.currency,
        p_user_id: payment.user_id,
      },
    );

    if (creditError) {
      console.error("Wallet credit RPC failed:", creditError.message);
      return NextResponse.json({ error: "Wallet credit failed; Paystack may retry this webhook." }, { status: 500 });
    }

    const creditPayload = Array.isArray(creditResult)
      ? creditResult[0]
      : creditResult;

    if (
      !creditPayload ||
      typeof creditPayload !== "object" ||
      creditPayload.success !== true
    ) {
      console.error("Paystack wallet credit RPC did not explicitly confirm success.");
      return NextResponse.json(
        { error: "Wallet credit was not confirmed. Paystack may retry this webhook." },
        { status: 500 },
      );
    }

    return NextResponse.json({ received: true, processed: true, result: creditResult });
  } catch (error) {
    console.error("Paystack webhook processing error:", error);
    return NextResponse.json({ error: "Payment processing failed; retry is possible." }, { status: 500 });
  }
}
