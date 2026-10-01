import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { amount, email } = await req.json();
    const dodoKey = process.env.DODO_PAYMENTS_API_KEY || "live_sk_placeholder";

    const res = await fetch("https://dodopayments.com", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + dodoKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(parseFloat(amount) * 100),
        currency: "GHS",
        customer: { email },
        billing_rdr: "https://vercel.app"
      }),
    });

    const data = await res.json();
    if (res.ok && data.payment_url) {
      return NextResponse.json({ authorization_url: data.payment_url });
    }
    return NextResponse.json({ error: data.message || "Dodo Initialization Failed" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}