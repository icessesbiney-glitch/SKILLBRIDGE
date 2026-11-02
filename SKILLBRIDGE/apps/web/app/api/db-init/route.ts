import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase configuration is unavailable.' }, { status: 503 });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // This checks for the table and safely catches if it does not exist yet
    const { error } = await supabase.from('payments').select('id').limit(1);
    
    return NextResponse.json({ 
      status: 'Ready', 
      message: 'Database endpoint is active. If errors persist, verify table structures in Supabase Dashboard.',
      details: error ? error.message : 'No errors caught'
    }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database verification failed.';
    return NextResponse.json({ error: 'Database Verification Failed', message }, { status: 500 });
  }
}
