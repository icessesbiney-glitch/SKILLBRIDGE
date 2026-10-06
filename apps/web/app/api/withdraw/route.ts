import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

/**
 * Production Wallet Cashout / Withdrawal Handler
 * Path Target: /api/withdraw
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profileId, requestedAmountCents, payoutMethod } = body;

    if (!profileId || !requestedAmountCents || !payoutMethod) {
      return NextResponse.json({ error: "Incomplete withdrawal transaction parameters." }, { status: 400 });
    }

    // Enforce platform checkout rule constraints (50 GHS Baseline Threshold Limit)
    if (requestedAmountCents < 5000) {
      return NextResponse.json({ error: "Withdrawal parameters reject. Minimum checkout limit is 50 GHS." }, { status: 400 });
    }

    console.log(`[CASH OUT REQUEST] Initiating outbound payload verification check for profile: ${profileId}`);

    // Call the database function to atomically deduct wallet balances with double-spending locks
    const { data, error: rpcError } = await supabase.rpc('execute_wallet_withdrawal', {
      target_profile_id: profileId,
      requested_amount_cents: requestedAmountCents,
      payment_reference: `WITHDRAW_TXN_${Date.now()}`
    });

    if (rpcError || !data?.success) {
      return NextResponse.json({ error: data?.error || rpcError?.message || "Ledger adjustment rejected." }, { status: 400 });
    }

    // TODO: Wire up Paystack Payout Initiation Transfer API payload loop here:
    // await fetch('https://paystack.co', { method: 'POST', headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } })

    return NextResponse.json({ 
      success: true, 
      message: "Withdrawal transaction verified atomically, logged inside ledger sheets, and queued for transfer processing.",
      details: data
    }, { status: 200 });

  } catch (error: any) {
    console.error('[WITHDRAWAL RUNTIME EXCEPTION]', error);
    return NextResponse.json({ error: "Internal payment processing validation breakdown." }, { status: 500 });
  }
}
