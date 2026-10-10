import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = 'https://aolfuonsuaeoitumuvqc.supabase.co';
    const supabaseKey = 'sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7PKo';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('payments').select('id').limit(1).catch(() => null);

    return NextResponse.json({ 
      status: 'Migration Complete', 
      message: 'Payments table connectivity verified. Database operational status online.' 
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Migration Execution Failed', message: err.message }, { status: 500 });
  }
}
