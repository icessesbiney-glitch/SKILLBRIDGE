import { NextResponse } from "next/server";
import { adminClient, authenticate } from "../../_lib/auth";

export async function POST(req: Request) {
  try {
    const auth = await authenticate(req);
    if ("error" in auth) return auth.error;
    const supabase = adminClient();
    if (!supabase) return NextResponse.json({ error: "Server is not configured." }, { status: 500 });

    const body = await req.json();
    const { latitude, longitude, bearing, speedKmh } = body;
    const riderId = auth.user.id;

    const { data: profile } = await supabase.from("profiles").select("role_tier").eq("id", riderId).single();
    if (profile?.role_tier !== "driver_rider") {
      return NextResponse.json({ error: "Only riders can publish location." }, { status: 403 });
    }

    if (
      !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 || Math.abs(longitude) > 180
    ) {
      return NextResponse.json(
        { error: "Incomplete geospatial telemetry tracking coordinates." },
        { status: 400 }
      );
    }

    // Convert speed to m/s for your schema definition layout (km/h divided by 3.6)
    const speedMs = speedKmh ? parseFloat((speedKmh / 3.6).toFixed(2)) : 0.00;

    // 2. Log real-time GPS coordinate point trace directly into admin_gps_tracking table
    const { error: trackingError } = await supabase
      .from("admin_gps_tracking")
      .insert({
        rider_id: riderId,
        live_latitude: latitude,
        live_longitude: longitude,
        bearing: bearing || 0.00,
        speed: speedMs,
        is_active_delivery: true,
        last_ping_time: new Date().toISOString()
      });

    if (trackingError) {
      return NextResponse.json({ error: trackingError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Rider geospatial positioning matrix updated atomically."
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
