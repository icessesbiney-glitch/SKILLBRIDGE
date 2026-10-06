import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { riderId, latitude, longitude, bearing, speedKmh, currentStatus } = body;

    // 1. Structural Parameter Integrity Verification
    if (!riderId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Incomplete geospatial telemetry tracking coordinates." },
        { status: 400 }
      );
    }

    // 2. Log real-time GPS coordinate point trace into historical telemetry table
    const { error: trackingError } = await supabase
      .from("delivery_location_tracking")
      .insert({
        rider_id: riderId,
        latitude,
        longitude,
        bearing: bearing || 0.00,
        speed_kmh: speedKmh || 0.00,
        recorded_at: new Date().toISOString()
      });

    if (trackingError) {
      return NextResponse.json({ error: trackingError.message }, { status: 400 });
    }

    // 3. Update the rider's master profile availability state row dynamically
    if (currentStatus) {
      await supabase
        .from("rider_profiles")
        .update({
          current_status: currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", riderId);
    }

    return NextResponse.json({
      success: true,
      message: "Rider geospatial positioning matrix updated atomically."
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
