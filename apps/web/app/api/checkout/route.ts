import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error: "This legacy checkout endpoint is disabled. Use the authenticated Paystack initialization flow.",
    },
    { status: 410 },
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed." },
    { status: 405 },
  );
}
