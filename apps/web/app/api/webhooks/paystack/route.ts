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
    
    // 1. Validate signature signature hash to secure your endpoint from unauthorized mock payloads
    const paystackSignature = request.headers.get('x-paystack-signature');
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY!).update(rawBody).digest('hex');

    if (hash !== paystackSignature) {
      return NextResponse.json({ error: 'Unauthorized signature payload hash mismatch' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log(`[PAYSTACK WEBHOOK]: Intercepted event signature data matrix: ${event.event}`);

    // 2. Process transfer success or failure compliance updates dynamically
    if (event.event === 'transfer.success') {
      const { reference, recipient } = event.data;
      console.log(`✅ [PAYMENT SUCCESS]: Payout reference ${reference} cleared successfully.`);
      
      // Additional log updates or transactional status updates can be committed here
    } else if (event.event === 'transfer.failed') {
      const { reference, amount, recipient } = event.data;
      console.log(`❌ [PAYMENT FAILED]: Payout reference ${reference} dropped. Reverting wallet metrics...`);

      // Resolve the transaction row logs map to pull corresponding wallet reference pointer mappings
      const { data: transaction } = await supabase
        .from('wallet_transactions')
        .select('wallet_id')
        .eq('reference_id', reference)
        .single();

      if (transaction) {
        const refundAmount = amount / 100; // Convert minor pesewas back to base currency GHS
        
        // Transaction reversal operation logic rule to return funds back to driver's balance ledger bounds
        const { data: wallet } = await supabase
          .from('rider_wallets')
          .select('current_balance')
          .eq('id', transaction.wallet_id)
          .single();

        if (wallet) {
          await supabase
            .from('rider_wallets')
            .update({ current_balance: wallet.current_balance + refundAmount, updated_at: new Date().toISOString() })
            .eq('id', transaction.wallet_id);

          await supabase.from('wallet_transactions').insert([
            {
              wallet_id: transaction.wallet_id,
              amount: refundAmount,
              transaction_type: 'delivery_payout', // Refund balance returned matrix
              reference_id: `REFUND-${reference}`
            }
          ]);
          console.log(`🎰 [REFUND COMPLETED]: Returned GHS ${refundAmount} securely back to account wallet ledger bounds.`);
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
