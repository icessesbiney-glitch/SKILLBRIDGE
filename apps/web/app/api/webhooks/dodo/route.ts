import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-dodo-signature') || '';
    const computedSignature = crypto
      .createHmac('sha256', process.env.DODO_WEBHOOK_SECRET || '')
      .update(payload)
      .digest('hex');

    if (computedSignature !== signature) {
      return NextResponse.json({ error: 'Signature Verification Failed' }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const adminClient = getAdminSupabase();

    if (event.type === 'checkout.succeeded') {
      const { userId } = event.data.metadata || {};
      if (userId) {
        await adminClient.rpc('increment_wallet_balance', {
          target_user_id: userId,
          amount_to_add: (event.data.amount || 0) / 100
        });
      }
    }
    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
