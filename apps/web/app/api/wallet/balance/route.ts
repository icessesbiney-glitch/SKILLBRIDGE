import { NextResponse } from 'next/server';
import { adminClient, authenticate } from '../../_lib/auth';

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if ('error' in auth) return auth.error;

  const supabase = adminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Wallet services are not configured.' }, { status: 503 });
  }

  const { data: wallet, error: walletError } = await supabase
    .from('platform_wallets')
    .select('id, profile_id, balance_cents, currency, updated_at')
    .eq('profile_id', auth.user.id)
    .maybeSingle();

  if (walletError) {
    console.error('Unable to load wallet balance.', walletError);
    return NextResponse.json({ error: 'Unable to load wallet balance.' }, { status: 503 });
  }
  if (!wallet) {
    return NextResponse.json({ error: 'Complete account verification to initialize your wallet.' }, { status: 404 });
  }

  const { data: withdrawals, error: withdrawalError } = await supabase
    .from('ledger_entries')
    .select('id, amount_cents, reference_id, created_at')
    .eq('wallet_id', wallet.id)
    .eq('entry_type', 'withdrawal')
    .lt('amount_cents', 0)
    .order('created_at', { ascending: false })
    .limit(10);

  if (withdrawalError) {
    console.error('Unable to load wallet withdrawal history.', withdrawalError);
    return NextResponse.json({ error: 'Unable to load wallet activity.' }, { status: 503 });
  }

  const reversalReferences = (withdrawals ?? []).map(
    (withdrawal) => `reversal_${withdrawal.reference_id}`,
  );
  let reversed = new Set<string>();
  if (reversalReferences.length > 0) {
    const { data: reversals, error: reversalError } = await supabase
      .from('ledger_entries')
      .select('reference_id')
      .eq('wallet_id', wallet.id)
      .in('reference_id', reversalReferences);
    if (reversalError) {
      console.error('Unable to load wallet reversal status.', reversalError);
      return NextResponse.json({ error: 'Unable to load wallet activity.' }, { status: 503 });
    }
    reversed = new Set((reversals ?? []).map((row) => row.reference_id));
  }

  return NextResponse.json({
    success: true,
    wallet: {
      id: wallet.id,
      profileId: wallet.profile_id,
      balanceGhs: (wallet.balance_cents / 100).toFixed(2),
      currency: wallet.currency,
      updatedAt: wallet.updated_at,
    },
    recentWithdrawals: (withdrawals ?? []).map((withdrawal) => ({
      id: withdrawal.id,
      amountGhs: (Math.abs(withdrawal.amount_cents) / 100).toFixed(2),
      reference: withdrawal.reference_id,
      status: reversed.has(`reversal_${withdrawal.reference_id}`) ? 'reversed' : 'submitted',
      createdAt: withdrawal.created_at,
    })),
  });
}
