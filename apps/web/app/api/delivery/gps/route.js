import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export const dynamic = 'force-dynamic';
export async function POST(req) {
 try {
 const b = await req.json();
 const latVal = b.latitude ? Number(b.latitude) : 0;
 const lngVal = b.longitude ? Number(b.longitude) : 0;
 const speedVal = b.speed ? Number(b.speed) : 0;
 const statusVal = b.status || 'en_route';

 const { data, error } = await supabase.from('delivery_gps').insert([{ latitude: latVal, longitude: lngVal, speed: speedVal, status: statusVal }]).select();
 if (error) return NextResponse.json({ status: 'Postgres_Error', message: error.message, code: error.code }, { status: 400 });
 return NextResponse.json({ status: 'success', database_record: data });
 } catch(e) {
 return NextResponse.json({ status: 'Catch_Error', message: e.message }, { status: 400 });
 }
}
