import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    const rawBody = await request.text();
    const paystackSignature = request.headers.get('x-paystack-signature');
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY!).update(rawBody).digest('hex');

    if (hash !== paystackSignature) {
      return NextResponse.json({ error: 'Unauthorized signature signature payload hash mismatch' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    if (event.event === 'transfer.failed') {
      const { reference, amount } = event.data;
      const { data: transaction } = await supabase.from('wallet_transactions').select('wallet_id').eq('reference_id', reference).single();
      if (transaction) {
        const refundAmount = amount / 100;
        const { data: wallet } = await supabase.from('rider_wallets').select('current_balance').eq('id', transaction.wallet_id).single();
        if (wallet) {
          await supabase.from('rider_wallets').update({ current_balance: wallet.current_balance + refundAmount, updated_at: new Date().toISOString() }).eq('id', transaction.wallet_id);
          await supabase.from('wallet_transactions').insert([{ wallet_id: transaction.wallet_id, amount: refundAmount, transaction_type: 'delivery_payout', reference_id: `REFUND-${reference}` }]);
        }
      }
    }
    return new NextResponse('OK', { status: 200 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
