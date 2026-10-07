import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { riderId, latitude, longitude, bearing, speedKmh } = body;

    // 1. Structural Parameter Integrity Verification
    if (!riderId || latitude === undefined || longitude === undefined) {
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
