import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId, amount, channel } = await request.json();
    const adminClient = getAdminSupabase();

    const { data: wallet } = await adminClient
      .from('platform_wallets')
      .select('available_balance')
      .eq('user_id', userId)
      .single();

    if (!wallet || wallet.available_balance < amount) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }
    return NextResponse.json({ success: true, channel });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
