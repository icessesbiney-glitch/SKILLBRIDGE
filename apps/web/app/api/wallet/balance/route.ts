import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    // 1. Structural Integrity Check
    if (!userId) {
      return NextResponse.json({ error: 'Missing required userId profile context attribute.' }, { status: 400 });
    }

    // 2. Fetch active wallet record matching the profile
    const { data: walletData, error: walletError } = await supabase
      .from('platform_wallets')
      .select('id, profile_id, balance_cents, currency, updated_at')
      .eq('profile_id', userId)
      .single();

    if (walletError) {
      return NextResponse.json({ error: walletError.message }, { status: 500 });
    }

    // 3. Fetch recent withdrawal ledger activities for the profile
    const { data: historyData, error: historyError } = await supabase
      .from('withdrawal_ledger')
      .select('id, amount, fee_applied, final_payout, payout_status, reference_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) {
      return NextResponse.json({ error: historyError.message }, { status: 500 });
    }

    // 4. Return combined metrics atomically
    return NextResponse.json({
      success: true,
      wallet: {
        id: walletData.id,
        profileId: walletData.profile_id,
        balanceGhs: (walletData.balance_cents / 100).toFixed(2),
        currency: walletData.currency,
        updatedAt: walletData.updated_at
      },
      recentWithdrawals: historyData
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
