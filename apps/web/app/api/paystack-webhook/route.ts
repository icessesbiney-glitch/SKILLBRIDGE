import { NextRequest, NextResponse } from 'next/server';
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
  }
}
