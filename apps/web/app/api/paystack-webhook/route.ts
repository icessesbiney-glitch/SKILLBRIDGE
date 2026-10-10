import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    
    // Pull configuration parameters dynamically on demand inside the execution runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const secret = process.env.PAYSTACK_SECRET_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Configuration Error', message: 'Missing live Supabase project environment configurations.' }, { status: 500 });
    }

    if (secret && secret !== 'sk_test_your_real_paystack_secret_key') {
      const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
      if (hash !== signature) {
        return NextResponse.json({ error: 'Signature Mismatch' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from('payments')
      .insert([{ 
        reference: payload.data?.reference || 'test_ref_' + Date.now(), 
        status: payload.data?.status || 'success', 
        amount: payload.data?.amount || 0,
        meta_data: payload
      }]);

    if (error) {
      return NextResponse.json({ error: 'Database Write Rejection', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: 'Success' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server Internal Crash Handler', message: err.message }, { status: 500 });
  }
}
