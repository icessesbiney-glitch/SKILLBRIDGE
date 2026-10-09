import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const incomingSignature = req.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY || "";
    
    const computedSignature = crypto
      .createHmac("sha512", secret)
      .update(bodyText)
      .digest("hex");
    
    console.log("=== PAYSTACK WEBHOOK HANDSHAKE DIAGNOSTICS ===");
    console.log("Incoming Payload Header Signature:", incomingSignature);
    console.log("Computed Runtime Shell Signature:", computedSignature);
    
    if (incomingSignature !== computedSignature) {
      return new NextResponse("Cryptographic Signature Mismatch", { status: 401 });
    }
    
    return NextResponse.json({ success: true, reference: "WITHDRAW_TXN_VERIFIED" });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
