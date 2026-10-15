import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error: "Withdrawals are temporarily unavailable while secure Paystack Transfers are being implemented.",
    },
    { status: 501 },
  );
}
