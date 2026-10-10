import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    const body = await request.json();
    const { vendorId, orderReference, grossAmount } = body;

    if (!vendorId || !orderReference || !grossAmount) {
      return NextResponse.json({ error: 'Missing critical merchant settlement parameters' }, { status: 400 });
    }

    const commissionFee = parseFloat((grossAmount * 0.10).toFixed(2));
    const netPayout = parseFloat((grossAmount - commissionFee).toFixed(2));

    await supabase.from('vendor_wallets').insert([{ vendor_id: vendorId, accumulated_earnings: 0.00 }]).onConflict('vendor_id').doNothing();
    const { data: wallet } = await supabase.from('vendor_wallets').select('id, accumulated_earnings').eq('vendor_id', vendorId).single();

    await supabase.from('vendor_wallets').update({ accumulated_earnings: wallet!.accumulated_earnings + netPayout, updated_at: new Date().toISOString() }).eq('id', wallet!.id);
    await supabase.from('vendor_ledger_transactions').insert([{ vendor_wallet_id: wallet!.id, gross_amount: grossAmount, platform_commission_deducted: commissionFee, net_payout_settled: netPayout, order_reference: orderReference }]);

    return NextResponse.json({ success: true, gross: grossAmount, commission: commissionFee, net: netPayout }, { status: 200 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
