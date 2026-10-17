import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

  if (!supabaseUrl || !publicKey || !serviceKey || !paystackSecret) {
    console.error("Paystack initialization server configuration is incomplete.");
    return jsonError("Payment service is not configured.", 503);
  }

  const authorization = req.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return jsonError("Authentication is required.", 401);

  const token = match[1];
  const authClient = createClient(supabaseUrl, publicKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: authData, error: authError } =
    await authClient.auth.getUser(token);

  if (authError || !authData.user) {
    return jsonError("Your session is invalid or expired.", 401);
  }

  let body: { amount?: unknown; email?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  if (
    typeof body.amount !== "number" &&
    typeof body.amount !== "string"
  ) {
    return jsonError("Enter a valid payment amount.", 400);
  }

  const amountText = String(body.amount).trim();
  if (!/^\d{1,7}(?:\.\d{1,2})?$/.test(amountText)) {
    return jsonError("Enter a valid amount in GHS.", 400);
  }

  const amount = Number(amountText);
  const amountInPesewas = Math.round(amount * 100);
  if (
    !Number.isFinite(amount) ||
    amount < 1 ||
    amount > 1_000_000 ||
    !Number.isSafeInteger(amountInPesewas)
  ) {
    return jsonError("The amount must be between GHS 1 and GHS 1,000,000.", 400);
  }

  const userEmail = authData.user.email;
  const requestedEmail =
    typeof body.email === "string" ? body.email.trim() : "";
  if (
    requestedEmail &&
    userEmail &&
    requestedEmail.toLowerCase() !== userEmail.toLowerCase()
  ) {
    return jsonError("The payment email must match your signed-in account.", 400);
  }
  if (!userEmail) return jsonError("Your account has no verified email address.", 400);

  const reference = `SB-${randomUUID()}`;
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: insertError } = await admin
    .from("paystack_transactions")
    .insert({
      user_id: authData.user.id,
      email: userEmail,
      reference,
      amount: amount.toFixed(2),
      currency: "GHS",
      status: "initialized",
      metadata: { platform: "skillbridge" },
    });

  if (insertError) {
    console.error("Could not create Paystack transaction:", insertError.message);
    return jsonError("Could not create your payment. Please try again.", 500);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  let callbackUrl: string;
  try {
    const parsed = new URL(siteUrl);
    if (
      parsed.protocol !== "https:" &&
      parsed.hostname !== "localhost" &&
      parsed.hostname !== "127.0.0.1"
    ) {
      throw new Error("Invalid site URL protocol");
    }
    callbackUrl = new URL("/checkout/success", parsed).toString();
  } catch {
    await admin
      .from("paystack_transactions")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("reference", reference)
      .eq("status", "initialized");
    return jsonError("The payment callback URL is not configured correctly.", 500);
  }

  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        email: userEmail,
        amount: amountInPesewas,
        currency: "GHS",
        reference,
        callback_url: callbackUrl,
        metadata: {
          user_id: authData.user.id,
          platform: "skillbridge",
        },
      }),
    });

    const result = await response.json();
    if (!response.ok || result?.status !== true || !result?.data?.authorization_url) {
      await admin
        .from("paystack_transactions")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("reference", reference)
        .eq("status", "initialized");

      console.error("Paystack initialization was rejected:", result?.message || response.status);
      return jsonError("Paystack could not initialize this payment.", 502);
    }

    return NextResponse.json({
      authorization_url: result.data.authorization_url,
      access_code: result.data.access_code,
      reference,
    });
  } catch (error) {
    console.error(
      "Paystack initialization request failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return jsonError("Payment provider is temporarily unavailable.", 502);
  }
}