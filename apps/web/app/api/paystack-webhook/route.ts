import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Live Production Paystack Webhook Handler
 * Target Endpoint: https://vercel.app
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const paystackSignature = req.headers.get('x-paystack-signature');
    const secretKey = process.env.PAYSTACK_LIVE_SECRET_KEY;

    if (!paystackSignature || !secretKey) {
      return NextResponse.json({ error: 'Missing security configuration parameters' }, { status: 401 });
    }

    // Cryptographic signature validation against payload forgery
    const computedHash = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex');

    if (computedHash !== paystackSignature) {
      return NextResponse.json({ error: 'Cryptographic signature mismatch' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const { reference, amount, customer } = event.data;
      console.log(`[PAYSTACK LIVE] Verified payment signature: ${reference} | Amount: ${amount / 100} GHS`);
    }

    return NextResponse.json({ status: 'success', message: 'Webhook handshake processed' }, { status: 200 });
  } catch (error: any) {
    console.error('[PAYSTACK ERROR]', error);
    return NextResponse.json({ error: 'Internal pipeline processing breakdown' }, { status: 500 });
  }
}
