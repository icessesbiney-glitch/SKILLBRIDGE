import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;

    if (!url || !anonKey || !serviceKey) {
      return NextResponse.json(
        { error: "Supabase server configuration is incomplete." },
        { status: 503 },
      );
    }
    if (!paystackKey) {
      return NextResponse.json(
        { error: "Paystack is not configured." },
        { status: 503 },
      );
    }

    const authorization = req.headers.get("authorization") || "";
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
    }

    const authClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authError } =
      await authClient.auth.getUser(match[1]);

    if (authError || !authData.user || !authData.user.email) {
      return NextResponse.json({ error: "Your session is invalid. Sign in again." }, { status: 401 });
    }

    const body = await req.json();
    const rawAmount = String(body?.amount ?? "").trim();

    if (!/^\d{1,7}(\.\d{1,2})?$/.test(rawAmount)) {
      return NextResponse.json({ error: "Enter a valid amount in GHS." }, { status: 400 });
    }

    const amount = Number(rawAmount);
    const pesewas = Math.round(amount * 100);

    if (!Number.isSafeInteger(pesewas) || pesewas < 100 || pesewas > 100000000) {
      return NextResponse.json({ error: "Amount must be between GHS 1.00 and GHS 1,000,000.00." }, { status: 400 });
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const reference = `SB-${randomUUID()}`;
    const { error: insertError } = await admin
      .from("paystack_transactions")
      .insert({
        user_id: authData.user.id,
        email: authData.user.email,
        reference,
        amount: (pesewas / 100).toFixed(2),
        currency: "GHS",
        status: "initialized",
        metadata: { platform: "skillbridge" },
      });

    if (insertError) {
      console.error("Unable to create payment record:", insertError.message);
      return NextResponse.json({ error: "Could not create the payment record." }, { status: 500 });
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_URL || req.nextUrl.origin).replace(/\/+$/, "");
    const gatewayResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: authData.user.email,
        amount: pesewas,
        currency: "GHS",
        reference,
        callback_url: `${siteUrl}/dashboard?payment=return&reference=${encodeURIComponent(reference)}`,
        metadata: { user_id: authData.user.id, platform: "skillbridge" },
      }),
      cache: "no-store",
    });

    const gateway = await gatewayResponse.json();

    if (!gatewayResponse.ok || !gateway.status || !gateway.data?.authorization_url) {
      await admin.from("paystack_transactions")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("reference", reference)
        .eq("status", "initialized");

      console.error("Paystack initialization failed:", gateway.message || gateway.status);
      return NextResponse.json({ error: "Paystack could not initialize this payment." }, { status: 502 });
    }

    return NextResponse.json({
      authorization_url: gateway.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json({ error: "Unable to start payment." }, { status: 500 });
  }
}
