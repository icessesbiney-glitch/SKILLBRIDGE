import { NextResponse } from 'next/server';
import { adminClient, authenticate } from '../../_lib/auth';

export async function POST(req: Request) {
  try {
    const auth = await authenticate(req);
    if ('error' in auth) return auth.error;
    const supabase = adminClient();
    if (!supabase) return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 });
    const userId = auth.user.id;

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
