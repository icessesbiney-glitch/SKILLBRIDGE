import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const paystackSignature = req.headers.get('x-paystack-signature') || '';
    const computedHash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
      .update(rawBody)
      .digest('hex');

    if (computedHash !== paystackSignature) {
      console.error('[SECURITY] Paystack Webhook Hash Verification Blocked. Invalid Signature Header.');
      return new NextResponse(JSON.stringify({ error: 'Unauthorized Signature' }), { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    console.log('[SUCCESS] Webhook Verified Securely from Paystack Engine. Event:', payload.event);
    return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}