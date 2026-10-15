import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error: "This payout operation is temporarily disabled until authenticated, balance-locked Paystack Transfers are implemented.",
    },
    { status: 501 },
  );
}
