import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Withdrawal is unavailable until a verified Paystack recipient and an atomic, server-side balance debit are connected." },
    { status: 501 }
  );
}
