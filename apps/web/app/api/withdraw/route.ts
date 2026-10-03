import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { userId, amount, channel } = await request.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aolfuonsuaeoitumuvqc.supabase.co';
    const adminClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_nLN657ZMe6wupW9HNdm6DQ_44_bZOjE', { auth: { persistSession: false } });

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
