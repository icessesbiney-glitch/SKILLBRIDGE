import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    const { userId, profileType, latitude, longitude, status } = await request.json();

    if (!userId || !profileType || !latitude || !longitude) {
      return NextResponse.json({ error: 'Missing telemetry matrices fields' }, { status: 400 });
    }

    // 1. Resolve or create the active tracking profile mapping
    let { data: profile, error: profileError } = await supabase
      .from('gps_profiles')
      .select('id')
      .eq('user_id', userId)
      .eq('profile_type', profileType)
      .single();

    if (profileError || !profile) {
      const { data: newProfile, error: createError } = await supabase
        .from('gps_profiles')
        .insert([{ user_id: userId, profile_type: profileType, is_active: true }])
        .select('id')
        .single();

      if (createError) throw createError;
      profile = newProfile;
    }

    // 2. Telemetry data matrix entry insertion
    const { error: telemetryError } = await supabase
      .from('gps_telemetry')
      .insert([
        {
          profile_id: profile.id,
          latitude: latitude,
          longitude: longitude,
          current_status: status || 'on_duty'
        }
      ]);

    if (telemetryError) throw telemetryError;

    return NextResponse.json({ success: true, message: 'GPS coordinates recorded cleanly' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
