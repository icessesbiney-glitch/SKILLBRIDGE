import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aolfuonsuaeoitumuvqc.supabase.co';
    const adminClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_nLN657ZMe6wupW9HNdm6DQ_44_bZOjE', { auth: { persistSession: false } });

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
