import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Connect natively using your direct database parameters
    const supabaseUrl = 'https://aolfuonsuaeoitumuvqc.supabase.co';
    const supabaseKey = 'sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7PKo';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // This checks for the table and safely catches if it does not exist yet
    const { error } = await supabase.from('payments').select('id').limit(1);
    
    return NextResponse.json({ 
      status: 'Ready', 
      message: 'Database endpoint is active. If errors persist, verify table structures in Supabase Dashboard.',
      details: error ? error.message : 'No errors caught'
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Database Verification Failed', message: err.message }, { status: 500 });
  }
}
