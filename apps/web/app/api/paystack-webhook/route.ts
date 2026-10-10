import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const secret = 'sk_test_6cb9d1b091f092e071c356778adcb0239b1a2082';

    if (secret) {
      const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
      if (hash !== signature) {
        return NextResponse.json({ error: 'Signature Mismatch' }, { status: 401 });
      }
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (parseErr: any) {
      return NextResponse.json({ error: 'JSON Payload Parsing Failed', details: parseErr.message, receivedData: rawBody }, { status: 400 });
    }

    console.log('✅ Webhook Handshake Verified Context Reference:', payload.data?.reference);
    return NextResponse.json({ status: 'Success', message: 'Signature handshake validated successfully.' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server Internal Crash Handler', message: err.message }, { status: 500 });
  }
}
