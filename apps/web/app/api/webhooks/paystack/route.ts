import { createClient } from '@supabase/supabase-js'; import { NextResponse } from 'next/server'; import crypto from 'crypto';
export async function POST(req: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const raw = await req.text(); const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!).update(raw).digest('hex');
    if (hash !== req.headers.get('x-paystack-signature')) return NextResponse.json({ error: 'Signature fault' }, { status: 401 });
    const ev = JSON.parse(raw);
    if (ev.event === 'transfer.failed') {
      const { reference, amount } = ev.data; const { data: tx } = await supabase.from('wallet_transactions').select('wallet_id').eq('reference_id', reference).single();
      if (tx) {
        const refund = amount / 100; const { data: w } = await supabase.from('rider_wallets').select('current_balance').eq('id', tx.wallet_id).single();
        if (w) {
          await supabase.from('rider_wallets').update({ current_balance: w.current_balance + refund, updated_at: new Date().toISOString() }).eq('id', tx.wallet_id);
          await supabase.from('wallet_transactions').insert([{ wallet_id: tx.wallet_id, amount: refund, transaction_type: 'delivery_payout', reference_id: `REFUND-${reference}` }]);
        }
      }
    }
    return new NextResponse('OK', { status: 200 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
