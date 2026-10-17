import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!url || !key || !secret) {
      return NextResponse.json(
        { error: "Required Supabase or Paystack environment variables are missing." },
        { status: 500 }
      );
    }

    const authorization = req.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authorization } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    const body = await req.json();
    const amountValue = body?.amount;
    const amountText =
      typeof amountValue === "number"
        ? String(amountValue)
        : typeof amountValue === "string"
          ? amountValue.trim()
          : "";
    const email = user.email;

    if (!/^\d{1,7}(?:\.\d{1,2})?$/.test(amountText)) {
      return NextResponse.json(
        { error: "Enter a valid amount with no more than two decimal places." },
        { status: 400 }
      );
    }

    const amount = Number(amountText);

    if (!email || !Number.isFinite(amount) || amount < 1 || amount > 1000000) {
      return NextResponse.json(
        { error: "A valid account email and payment amount from GHS 1.00 to GHS 1,000,000.00 are required." },
        { status: 400 }
      );
    }

    const reference = `SB-${randomUUID()}`;
    const amountInPesewas = Math.round(amount * 100);

    const { error: insertError } = await supabase
      .from("paystack_transactions")
      .insert({
        user_id: user.id,
        email,
        reference,
        amount: amountInPesewas / 100,
        currency: "GHS",
        status: "initialized",
        metadata: { user_id: user.id, platform: "skillbridge" },
      });

    if (insertError) {
      console.error("Could not create payment record:", insertError);
      return NextResponse.json(
        { error: "Could not create the payment record." },
        { status: 500 }
      );
    }

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin
    ).replace(/\/+$/, "");

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: String(amountInPesewas),
        currency: "GHS",
        reference,
        callback_url: `${siteUrl}/checkout/success`,
        metadata: { user_id: user.id, platform: "skillbridge" },
      }),
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || result.status !== true || !result.data?.authorization_url) {
      await supabase
        .from("paystack_transactions")
        .update({ status: "failed" })
        .eq("reference", reference);

      return NextResponse.json(
        { error: result.message || "Paystack initialization failed." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: result.data.authorization_url,
      access_code: result.data.access_code,
      reference,
    });
  } catch (error) {
    console.error("Paystack initialization error:", error);
    return NextResponse.json({ error: "Unable to initialize payment." }, { status: 500 });
  }
}
