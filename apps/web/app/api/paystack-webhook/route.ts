import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { error: "Paystack secret key is not configured." },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are not configured." },
        { status: 500 }
      );
    }

    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Paystack signature." },
        { status: 401 }
      );
    }

    const rawBody = await req.text();

    const expectedSignature = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    const signaturesMatch =
      signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

    if (!signaturesMatch) {
      return NextResponse.json(
        { error: "Invalid Paystack signature." },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody);

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    if (body.event === "charge.success") {
      const payment = body.data;

      const reference = payment.reference;
      const amount = Number(payment.amount || 0) / 100;
      const currency = payment.currency || "GHS";
      const email = payment.customer?.email || null;

      if (!reference) {
        return NextResponse.json(
          { error: "Missing Paystack transaction reference." },
          { status: 400 }
        );
      }

      const { data: existingPayment, error: lookupError } =
        await supabase
          .from("paystack_transactions")
          .select("id, user_id, status")
          .eq("reference", reference)
          .maybeSingle();

      if (lookupError) {
        console.error("Paystack payment lookup error:", lookupError);

        return NextResponse.json(
          { error: "Unable to locate payment record." },
          { status: 500 }
        );
      }

      if (!existingPayment) {
        console.error(
          "Received Paystack payment for unknown reference:",
          reference
        );

        return NextResponse.json(
          { error: "Unknown payment reference." },
          { status: 400 }
        );
      }

      if (existingPayment.status === "success") {
        return NextResponse.json(
          { received: true, duplicate: true },
          { status: 200 }
        );
      }

      const { error: updateError } = await supabase
        .from("paystack_transactions")
        .update({
          status: "success",
          paystack_transaction_id: payment.id ?? null,
          amount,
          currency,
          email,
          paid_at: payment.paid_at || new Date().toISOString(),
          metadata: payment.metadata || {},
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingPayment.id);

      if (updateError) {
        console.error(
          "Paystack payment update error:",
          updateError
        );

        return NextResponse.json(
          { error: "Unable to update payment record." },
          { status: 500 }
        );
      }

      console.log(
        `Paystack payment confirmed: ${reference} / GHS ${amount}`
      );
    }

    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Paystack webhook error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Webhook processing failed.",
      },
      { status: 400 }
    );
  }
}
