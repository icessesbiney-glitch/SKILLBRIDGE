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
    
    const computedSignature = crypto
      .createHmac("sha512", secret)
      .update(bodyText)
      .digest("hex");
    
    if (incomingSignature !== computedSignature) {
      return new NextResponse("Cryptographic Signature Mismatch", { status: 401 });
    }
    
    const payload = JSON.parse(bodyText);
    
    if (payload.event === "charge.success") {
      const ref = payload.data?.reference;
      if (!ref) {
        return new NextResponse("Error: Payload missing transaction reference data element.", { status: 400 });
      }
      
      // Perform database state mutation with explicit tracking catches
      const { data, error } = await supabase
        .from("transactions")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("reference", ref)
        .select();
        
      if (error) {
        return new NextResponse("?? Supabase Rejected Request: " + error.message + " (Code: " + error.code + ")", { status: 500 });
      }
      
      if (!data || data.length === 0) {
        return new NextResponse("?? Supabase Update Warning: Reference matching '" + ref + "' not found in transactions table.", { status: 404 });
      }
    }
    
    return NextResponse.json({ success: true, reference: payload.data?.reference || null });
  } catch (err: any) {
    return new NextResponse("?? Runtime Worker Crash Loop: " + (err.message || err.toString()), { status: 500 });
  }
}
