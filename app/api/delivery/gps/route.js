import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo'
);

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const bodyData = await req.json();
        const latVal = bodyData.latitude ? Number(bodyData.latitude) : 0;
        const lngVal = bodyData.longitude ? Number(bodyData.longitude) : 0;
        const speedVal = bodyData.speed ? Number(bodyData.speed) : 0;
        const statusVal = bodyData.status || 'en_route';

        const { data, error } = await supabase
            .from('delivery_gps')
            .insert([{ latitude: latVal, longitude: lngVal, speed: speedVal, status: statusVal }])
            .select();

        if (error) {
            return NextResponse.json({ status: 'Postgres_Error', message: error.message, code: error.code }, { status: 400 });
        }
        return NextResponse.json({ status: 'success', database_record: data });
    } catch(e) {
        return NextResponse.json({ status: 'Catch_Error', message: e.message }, { status: 400 });
    }
}
