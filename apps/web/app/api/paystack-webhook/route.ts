import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://supabase.co";
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7PKo";
    const secret = process.env.PAYSTACK_SECRET_KEY || "sk_test_your_real_paystack_secret_key";
    const supabase = createClient(url, anon);
    const bodyText = await req.text();
    const incomingSignature = req.headers.get("x-paystack-signature");
    const computedSignature = crypto.createHmac("sha512", secret).update(bodyText).digest("hex");
    if (incomingSignature !== computedSignature) { return new NextResponse("Cryptographic Signature Mismatch", { status: 401 }); }
    const payload = JSON.parse(bodyText);
    if (payload.event === "charge.success") {
      const ref = payload.data?.reference;
      if (ref) {
        const { error } = await supabase.from("transactions").update({ status: "completed", updated_at: new Date().toISOString() }).eq("reference", ref);
        if (error) { return new NextResponse("Database Write Rejection: " + error.message, { status: 500 }); }
      }
    }
    return NextResponse.json({ success: true, reference: payload.data?.reference || null });
  } catch (err: any) { return new NextResponse("Handler Execution Trap: " + (err instanceof Error ? err.message : String(err)), { status: 500 }); }
}
