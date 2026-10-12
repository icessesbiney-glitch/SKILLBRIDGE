import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export const dynamic = 'force-dynamic';
export async function POST(req) {
 try {
 const b = await req.json();
 const ref = b.data?.reference || 'skb-manual-' + Date.now();
 const amt = b.data?.amount ? Number(b.data.amount) : 0;
 const cur = b.data?.currency || 'GHS';
 const stat = b.data?.status || 'success';

 const { data, error } = await supabase.from('payments').insert([{ reference: ref, amount: amt, currency: cur, status: stat }]).select();
 if (error) return NextResponse.json({ status: 'Postgres_Error', message: error.message, code: error.code }, { status: 400 });
 return NextResponse.json({ status: 'success', database_record: data });
 } catch(e) {
 return NextResponse.json({ status: 'Catch_Error', message: e.message }, { status: 400 });
 }
}
