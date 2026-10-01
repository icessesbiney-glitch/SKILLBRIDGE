import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder"
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Monitors successful transaction callback hits from MTN, Telecel, and AT networks
    if (body.event === "charge.success") {
      const { amount, customer } = body.data;
      const ghcAmount = amount / 100; // Converts incoming value from pesewas to live GHS

      console.log(`✅ Mobile Money Deposit Captured: ₵${ghcAmount} for ${customer.email}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
