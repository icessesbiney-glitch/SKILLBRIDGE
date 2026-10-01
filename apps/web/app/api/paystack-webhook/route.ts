import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_API_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json({ error: "System Configuration Missing" }, { status: 500 });
  }
  try {
    const payload = await request.json();
    return NextResponse.json({ status: "success", received: true });
  } catch (err) {
    return NextResponse.json({ error: "Webhook Handler Failure" }, { status: 400 });
  }
}
