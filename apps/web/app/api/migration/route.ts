import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy';
    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    
    console.log('? [MIGRATION] Route parsed cleanly during local compilation.');
    return NextResponse.json({ status: 'active' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
