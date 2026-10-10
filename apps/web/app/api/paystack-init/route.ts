import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
<<<<<<< HEAD
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are not configured." },
        { status: 500 }
      );
    }

    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: "Paystack secret key is not configured." },
        { status: 500 }
      );
    }

    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: authorization,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired authentication session." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const amount = Number(body.amount);
    const email =
      typeof body.email === "string" && body.email.trim()
        ? body.email.trim()
        : user.email;

    if (!email) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid transaction amount." },
        { status: 400 }
      );
    }

    const amountInPesewas = Math.round(amount * 100);

    if (amountInPesewas < 100) {
      return NextResponse.json(
        { error: "The minimum payment amount is GHS 1.00." },
        { status: 400 }
      );
    }

    const reference = `SB-${crypto.randomUUID()}`;

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;

    const callbackUrl = `${siteUrl}/payment/callback`;

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: String(amountInPesewas),
          currency: "GHS",
          reference,
          callback_url: callbackUrl,
          metadata: {
            user_id: user.id,
            email,
            platform: "skillbridge",
          },
        }),
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      return NextResponse.json(
        {
          error:
            paystackData.message ||
            "Paystack transaction initialization failed.",
        },
        { status: 400 }
      );
    }

    const { data: paymentRecord, error: paymentRecordError } =
      await supabase
        .from("paystack_transactions")
        .insert({
          user_id: user.id,
          email,
          reference,
          paystack_transaction_id: paystackData.data?.id ?? null,
          amount,
          currency: "GHS",
          status: "initialized",
          metadata: {
            user_id: user.id,
            platform: "skillbridge",
          },
        })
        .select("id, reference, amount, currency, status")
        .single();

    if (paymentRecordError) {
      console.error(
        "Paystack transaction record error:",
        paymentRecordError
      );

      return NextResponse.json(
        {
          error: "Payment was initialized but could not be recorded.",
          reference,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference,
      payment: paymentRecord,
    });
  } catch (error) {
    console.error("Paystack initialization error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to initialize Paystack payment.",
      },
      { status: 500 }
    );
=======
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
    }

    const { amount, email } = await req.json();
    const parsedAmount = parseFloat(amount);

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
      return NextResponse.json({ error: "Amount must be at least GHS 1.00" }, { status: 400 });
    }

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Paystack expects the amount in pesewas
        amount: Math.round(parsedAmount * 100),
        currency: "GHS",
        email,
        callback_url: `${req.nextUrl.origin}/dashboard?payment=complete`,
      }),
    });

    const data = await res.json();
    if (res.ok && data.status && data.data?.authorization_url) {
      return NextResponse.json({
        authorization_url: data.data.authorization_url,
        reference: data.data.reference,
      });
    }
    return NextResponse.json({ error: data.message || "Paystack initialization failed" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
>>>>>>> cfc2e2d86a438fc386c68b7927c07fe07b861bb0
  }
}
