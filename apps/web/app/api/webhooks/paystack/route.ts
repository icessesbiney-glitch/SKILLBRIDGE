import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log('⚡ [PAYSTACK WEBHOOK] >>> Request received at endpoint!');
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey || !paystackSecret) {
      console.error('❌ Missing production environment variables.');
      return NextResponse.json({ error: 'Server configuration fault' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    const raw = await req.text();
    const hash = crypto.createHmac('sha512', paystackSecret).update(raw).digest('hex');
    const clientSig = req.headers.get('x-paystack-signature');

    if (hash !== clientSig) {
      console.log('❌ [PAYSTACK WEBHOOK] Hash match failed!');
      return NextResponse.json({ error: 'Signature fault' }, { status: 401 });
    }
    console.log('✅ [PAYSTACK WEBHOOK] Hash signature matched successfully!');

    const ev = JSON.parse(raw);
    if (ev.event === 'transfer.failed') {
      const { reference, amount } = ev.data;
      const { data: tx } = await supabase.from('wallet_transactions').select('wallet_id').eq('reference_id', reference).maybeSingle();
      if (tx) {
        const refund = amount / 100;
        const { data: w } = await supabase.from('rider_wallets').select('current_balance').eq('id', tx.wallet_id).maybeSingle();
        if (w) {
          await supabase.from('rider_wallets').update({ current_balance: w.current_balance + refund, updated_at: new Date().toISOString() }).eq('id', tx.wallet_id);
          await supabase.from('wallet_transactions').insert([{ wallet_id: tx.wallet_id, amount: refund, transaction_type: 'delivery_payout', reference_id: 'REFUND-' + reference }]);
          console.log('✅ [PAYSTACK WEBHOOK] Ledger balance corrections committed!');
        }
      }
    }
    return NextResponse.json({ status: 'success', event_processed: ev.event }, { status: 200 });
  } catch (err: any) {
    console.log('❌ [PAYSTACK WEBHOOK] Fatal error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}