import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-dodo-signature') || '';
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook configuration is unavailable.' }, { status: 503 });
    }
    const computedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    if (computedSignature !== signature) {
      return NextResponse.json({ error: 'Signature Verification Failed' }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase server configuration is unavailable.' }, { status: 503 });
    }
    const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
