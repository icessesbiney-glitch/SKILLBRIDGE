import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Cashout is unavailable until authenticated balances and Paystack transfers are connected." },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Cashout has been disabled because the previous route used a fabricated balance and did not send a real payout." },
    { status: 501 }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
