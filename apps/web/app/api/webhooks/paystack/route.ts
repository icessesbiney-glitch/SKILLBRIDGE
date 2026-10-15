import { POST as canonicalPaystackWebhook } from "../../paystack-webhook/route";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return canonicalPaystackWebhook(request);
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}