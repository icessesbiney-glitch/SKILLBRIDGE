import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

interface PayoutPayload {
  riderProfileId: string;
  mobileNumber: string;
  bankCode: 'MTN' | 'VOD' | 'ATL'; // Ghanaian Mobile Money Network Bank Providers Codes
  withdrawalAmount: number;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    const body: PayoutPayload = await request.json();
    const { riderProfileId, mobileNumber, bankCode, withdrawalAmount } = body;

    if (!riderProfileId || !mobileNumber || !bankCode || !withdrawalAmount) {
      return NextResponse.json({ error: 'Missing critical disbursement payout parameters' }, { status: 400 });
    }

    // 1. Verify current available wallet ledger balance bounds inside your database
    const { data: wallet, error: walletError } = await supabase
      .from('rider_wallets')
      .select('id, current_balance')
      .eq('rider_profile_id', riderProfileId)
      .single();

    if (walletError || !wallet || wallet.current_balance < withdrawalAmount) {
      return NextResponse.json({ error: 'Insufficient ledger balance context to process withdrawal requests' }, { status: 403 });
    }

    // 2. Generate a unique reference identifier mapping index
    const transferReference = `TR-${Math.floor(100000 + Math.random() * 900000)}`;

    console.log(`[PAYOUT ENGINE]: Initiating Paystack transfer reference ${transferReference} for amount GHS ${withdrawalAmount}`);

    // 3. Dispatch the Transfer payload directly onto the Paystack REST Gateway APIs endpoints
    const paystackResponse = await fetch('https://paystack.co', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: "balance",
        amount: Math.round(withdrawalAmount * 100), // Convert currency amount cleanly to minor pesewas denominations units
        reference: transferReference,
        recipient: mobileNumber,
        currency: "GHS"
      })
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      return NextResponse.json({ error: paystackData.message || 'Paystack serverless payment routing exception' }, { status: 502 });
    }

    // 4. Update the local rider wallets ledger bounds and write a withdrawal transaction row
    const { error: ledgerError } = await supabase
      .from('rider_wallets')
      .update({ current_balance: wallet.current_balance - withdrawalAmount, updated_at: new Date().toISOString() })
      .eq('id', wallet.id);

    if (ledgerError) throw ledgerError;

    await supabase.from('wallet_transactions').insert([
      {
        wallet_id: wallet.id,
        amount: -withdrawalAmount,
        transaction_type: 'withdrawal_payout',
        reference_id: transferReference
      }
    ]);

    return NextResponse.json({
      success: true,
      message: 'Mobile Money Ghana (MMG) disbursement transfer processing initialized cleanly.',
      reference: transferReference
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
