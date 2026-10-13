import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const secret = process.env.PAYSTACK_SECRET_KEY || '';

    console.log("=== EXPLICIT WEBHOOK CHECK ===");
    console.log("Received Signature:", signature);

    const computedHash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    console.log("Computed Internal Hash:", computedHash);

    if (computedHash !== signature) {
      console.log("⨯ ERROR: Signature Mismatch");
      return new Response(JSON.stringify({ error: 'Signature Mismatch' }), { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log(`? SUCCESS: Webhook Event Verified -> ${event.event}`);

    return new Response(JSON.stringify({ verified: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
