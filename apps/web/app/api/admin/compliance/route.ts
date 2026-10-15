import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error: "Compliance submission is unavailable until authenticated database persistence is implemented.",
    },
    { status: 501 },
  );
}