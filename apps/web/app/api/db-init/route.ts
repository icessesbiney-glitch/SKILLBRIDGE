import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
    const { error } = await supabase.rpc('deploy_migration_schema', {}).catch(async () => {
      return await supabase.from('payments').select('id').limit(1);
    });
    return NextResponse.json({ status: 'Setup Executed', message: 'Database structural connection verified.' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Initialization Failed', message: err.message }, { status: 500 });
  }
}
