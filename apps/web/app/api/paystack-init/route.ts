import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();
    const response = await fetch("https://paystack.co", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "customer@skillbridge.app",
        amount: parseFloat(amount) * 100, 
        currency: "GHS",
        channels: ["mobile_money"],
        callback_url: "https://skillbridge-nine-mu.vercel.app"
      })
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
