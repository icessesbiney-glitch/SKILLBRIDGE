import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminClient } from '../../_lib/auth';

function validSignature(payload: string, signature: string): boolean {
  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    if (!validSignature(payload, request.headers.get('x-dodo-signature') || '')) {
      return NextResponse.json({ error: 'Signature Verification Failed' }, { status: 401 });
    }
    const adminClientInstance = adminClient();
    if (!adminClientInstance) return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 });

    const event = JSON.parse(payload);
    if (event.type === 'checkout.succeeded') {
      const { userId } = event.data?.metadata || {};
      if (userId) {
        await adminClientInstance.rpc('increment_wallet_balance', {
          target_user_id: userId,
          amount_to_add: (event.data.amount || 0) / 100,
        });
      }
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}
