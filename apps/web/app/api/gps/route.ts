import { NextResponse } from 'next/server';
import { adminClient, authenticate } from '../_lib/auth';

interface TelemetryPayload {
  profileType: 'driver' | 'rider';
  latitude: number;
  longitude: number;
  status?: string;
}

export async function POST(request: Request) {
  try {
    const auth = await authenticate(request);
    if ('error' in auth) return auth.error;
    const supabase = adminClient();
    if (!supabase) return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 });
    const body: TelemetryPayload = await request.json();
    const { profileType, latitude, longitude, status } = body;
    const userId = auth.user.id;

    const { data: me } = await supabase.from('profiles').select('role_tier').eq('id', userId).single();
    if (me?.role_tier !== 'driver_rider') {
      return NextResponse.json({ error: 'Only riders can publish location.' }, { status: 403 });
    }
    if (profileType !== 'driver' && profileType !== 'rider') {
      return NextResponse.json({ error: 'Invalid profile type.' }, { status: 400 });
    }

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
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
