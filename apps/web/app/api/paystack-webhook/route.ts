import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const incomingSignature = req.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY || "";
    
    const computedSignature = crypto
      .createHmac("sha512", secret)
      .update(bodyText)
      .digest("hex");
    
    if (incomingSignature !== computedSignature) {
      return new NextResponse("Cryptographic Signature Mismatch", { status: 401 });
    }
    
    const payload = JSON.parse(bodyText);
    
    if (payload.event === "charge.success") {
      const transactionReference = payload.data.reference;
      
      await supabase
        .from("transactions")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("reference", transactionReference);
    }
    
    return NextResponse.json({ success: true, reference: payload.data?.reference });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
