import { NextResponse } from 'next/server';
import { adminClient, authenticate, isAdmin } from '../../_lib/auth';

// Admin-only: credits a vendor's wallet with the order total minus a 10% commission.
export async function POST(req: Request) {
  try {
    const auth = await authenticate(req);
    if ('error' in auth) return auth.error;
    if (!(await isAdmin(auth.user.id))) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }
    const supabase = adminClient();
    if (!supabase) return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 });

    const { vendorId, orderReference, grossAmount } = await req.json();
    const gross = Number(grossAmount);
    if (!vendorId || !orderReference || !Number.isFinite(gross) || gross <= 0) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('vendor_ledger_transactions')
      .select('id')
      .eq('order_reference', orderReference)
      .maybeSingle();
    if (existing) return NextResponse.json({ error: 'Order already settled.' }, { status: 409 });

    const comm = parseFloat((gross * 0.1).toFixed(2));
    const net = parseFloat((gross - comm).toFixed(2));

    await supabase
      .from('vendor_wallets')
      .upsert([{ vendor_id: vendorId, accumulated_earnings: 0 }], { onConflict: 'vendor_id', ignoreDuplicates: true });
    const { data: w, error: wErr } = await supabase
      .from('vendor_wallets')
      .select('id, accumulated_earnings')
      .eq('vendor_id', vendorId)
      .single();
    if (wErr || !w) return NextResponse.json({ error: 'Vendor wallet not found.' }, { status: 404 });

    await supabase
      .from('vendor_wallets')
      .update({ accumulated_earnings: Number(w.accumulated_earnings) + net, updated_at: new Date().toISOString() })
      .eq('id', w.id);
    await supabase.from('vendor_ledger_transactions').insert([
      { vendor_wallet_id: w.id, gross_amount: gross, platform_commission_deducted: comm, net_payout_settled: net, order_reference: orderReference },
    ]);
    return NextResponse.json({ success: true, gross, commission: comm, net }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
