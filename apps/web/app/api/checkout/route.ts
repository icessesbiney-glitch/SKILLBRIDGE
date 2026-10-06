import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server database configuration parameters are missing." },
        { status: 500 }
      );
    }

    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: "Paystack secret verification key is not configured." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { amount, currency, email, userId, metadata } = body;

    if (!amount || !email || !userId) {
      return NextResponse.json(
        { error: "Missing required checkout parameters: amount, email, and userId are mandatory." },
        { status: 400 }
      );
    }

    const txAmount = Number(amount);
    if (!Number.isFinite(txAmount) || txAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid currency processing amount allocation specified." },
        { status: 400 }
      );
    }

    const amountInPesewas = Math.round(txAmount * 100);
    const reference = `SB-CHKT-${crypto.randomUUID()}`;
    const targetCurrency = currency || "GHS";

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const callbackUrl = `${siteUrl}/payment/callback`;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const paystackResponse = await fetch("https://paystack.co", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: String(amountInPesewas),
        currency: targetCurrency,
        reference,
        callback_url: callbackUrl,
        metadata: {
          ...metadata,
          user_id: userId,
          platform: "skillbridge",
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      return NextResponse.json(
        { error: paystackData.message || "Paystack transaction engine failure during initialization phase." },
        { status: 400 }
      );
    }

    const { error: dbError } = await supabase
      .from("paystack_transactions")
      .insert({
        user_id: userId,
        email,
        reference,
        paystack_transaction_id: paystackData.data?.id ?? null,
        amount: txAmount,
        currency: targetCurrency,
        status: "initialized",
        metadata: {
          ...metadata,
          user_id: userId,
          platform: "skillbridge_checkout",
        },
      });

    if (dbError) {
      console.error("Failed to commit initial checkout record log to database ledger:", dbError);
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: paystackData.data.authorization_url,
      reference: reference,
    });
  } catch (error: any) {
    console.error("Checkout transaction handler runtime crash:", error);
    return NextResponse.json(
      { error: error.message || "Internal server exception while processing checkout initialization." },
      { status: 500 }
    );
  }
}
