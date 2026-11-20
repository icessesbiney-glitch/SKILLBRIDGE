import { NextResponse } from "next/server";
import { adminClient, authenticate } from "../_lib/auth";
import { readRequestBody, RequestBodyTooLargeError } from "../_lib/request-body";

type CheckoutPayload = {
  amount?: unknown;
  currency?: unknown;
};

type PaystackInitialization = {
  status?: boolean;
  data?: {
    id?: number;
    authorization_url?: string;
  };
};

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if ("error" in auth) return auth.error;

  const supabase = adminClient();
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!supabase || !secretKey) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
  }

  let payload: CheckoutPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(await readRequestBody(request, 16_384)));
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    }
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Invalid checkout details." }, { status: 400 });
  }

  const amountText = typeof payload.amount === "number" || typeof payload.amount === "string"
    ? String(payload.amount)
    : "";
  if (!/^\d{1,9}(?:\.\d{1,2})?$/.test(amountText)) {
    return NextResponse.json({ error: "Enter a valid amount in GHS." }, { status: 400 });
  }

  const amount = Number(amountText);
  const amountInPesewas = Math.round(amount * 100);
  if (!Number.isSafeInteger(amountInPesewas) || amountInPesewas < 100) {
    return NextResponse.json({ error: "The minimum wallet funding amount is GHS 1.00." }, { status: 400 });
  }

  if (payload.currency !== undefined && payload.currency !== "GHS") {
    return NextResponse.json({ error: "Only GHS payments are supported." }, { status: 400 });
  }

  if (!auth.user.email) {
    return NextResponse.json({ error: "Your account must have an email address to make a payment." }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || new URL(request.url).origin;
  let callbackUrl: string;
  try {
    const url = new URL("/checkout/success", baseUrl);
    if (url.protocol !== "https:" && url.hostname !== "localhost") {
      return NextResponse.json({ error: "The payment callback URL is not securely configured." }, { status: 503 });
    }
    callbackUrl = url.toString();
  } catch {
    return NextResponse.json({ error: "The payment callback URL is invalid." }, { status: 503 });
  }

  const reference = `SB-CHKT-${crypto.randomUUID()}`;
  let paystackResponse: Response;
  try {
    paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: auth.user.email,
        amount: String(amountInPesewas),
        currency: "GHS",
        reference,
        callback_url: callbackUrl,
        metadata: { user_id: auth.user.id, platform: "skillbridge" },
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    console.error("Paystack initialization request failed.", error);
    return NextResponse.json({ error: "Payment provider is temporarily unavailable." }, { status: 502 });
  }

  let payment: PaystackInitialization | null = null;
  try {
    payment = await paystackResponse.json() as PaystackInitialization;
  } catch {
    return NextResponse.json({ error: "Payment provider returned an invalid response." }, { status: 502 });
  }

  const checkoutUrl = payment?.data?.authorization_url;
  if (!paystackResponse.ok || !payment?.status || !checkoutUrl || !payment.data?.id) {
    return NextResponse.json({ error: "Payment provider could not initialize this transaction." }, { status: 502 });
  }

  try {
    const { error } = await supabase.from("paystack_transactions").insert({
      user_id: auth.user.id,
      email: auth.user.email,
      reference,
      paystack_transaction_id: payment.data.id,
      amount: amountInPesewas / 100,
      currency: "GHS",
      status: "initialized",
      metadata: { user_id: auth.user.id, platform: "skillbridge_checkout" },
    });

    if (error) {
      console.error("Unable to record initialized Paystack transaction.", error);
      return NextResponse.json({ error: "Unable to safely start the payment. Please try again." }, { status: 503 });
    }
  } catch (error) {
    console.error("Unable to record initialized Paystack transaction.", error);
    return NextResponse.json({ error: "Unable to safely start the payment. Please try again." }, { status: 503 });
  }

  return NextResponse.json({ success: true, checkoutUrl, reference });
}
