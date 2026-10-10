<<<<<<< HEAD
﻿import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const secret = process.env.PAYSTACK_SECRET_KEY || 'sk_live_0c4438dc6168f7d3e51fea88d6962e259416cac5';
    
    const hash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    if (hash !== req.headers.get('x-paystack-signature')) {
      return NextResponse.json({ error: 'Signature Mismatch', computed: hash }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log('✅ Paystack Webhook Event Verified:', event.event);
    return NextResponse.json({ status: 'success', reference: event.data?.reference }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
=======
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // The service role key is preferred so the wallet RPC can be locked down to the server
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!secretKey || !supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
    }

    // Paystack signs the raw body with HMAC SHA512 using the secret key
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";
    const expected = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");

    const valid =
      signature.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    if (body.event === "charge.success" && body.data?.status === "success") {
      const { amount, customer } = body.data;
      const ghsAmount = amount / 100;

      const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
      const { error } = await supabase.rpc("increment_wallet_balance", {
        user_email: customer.email,
        amount_to_add: ghsAmount,
      });
      if (error) throw error;
      console.log(`Paystack charge ${body.data.reference} credited to wallet`);
    }
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
>>>>>>> cfc2e2d86a438fc386c68b7927c07fe07b861bb0
  }
}
