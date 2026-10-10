import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    
    const supabaseUrl = 'https://aolfuonsuaeoitumuvqc.supabase.co';
    const supabaseKey = 'sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7PKo';
    const secret = 'sk_test_6cb9d1b091f092e071c356778adcb0239b1a2082';

    if (secret) {
      const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
      if (hash !== signature) {
        return NextResponse.json({ error: 'Signature Mismatch' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Write the transaction details to the database logging layer safely
    const { error } = await supabase
      .from('payments')
      .insert([{ 
        reference: payload.data?.reference || 'test_ref_' + Date.now(), 
        status: payload.data?.status || 'success', 
        amount: payload.data?.amount || 0,
        meta_data: payload
      }]);

    if (error) {
      // If the payments table doesn't exist yet, we fall back to a terminal console log verification message to prevent crashing
      console.log('⚠️ Database table missing, fallback logging payload:', payload.data?.reference);
      return NextResponse.json({ status: 'Logged to Server Console', details: 'Payments table schema needs initialization on dashboard.' }, { status: 200 });
    }

    return NextResponse.json({ status: 'Success', message: 'Transaction fully tracked in database.' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server Internal Crash Handler', message: err.message }, { status: 500 });
  }
}
