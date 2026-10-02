import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
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
  }
}
