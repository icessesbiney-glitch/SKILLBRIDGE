import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dispatchId, riderId, nextStatus } = body;

    // 1. Mandatory Data Attribute Verification Guard
    if (!dispatchId || !riderId || !nextStatus) {
      return NextResponse.json(
        { error: "Missing required dispatch operation attributes." },
        { status: 400 }
      );
    }

    // 2. Atomic state transition update block
    const { data, error: updateError } = await supabase
      .from("delivery_dispatches")
      .update({
        payload_status: nextStatus,
        assignment_timestamp: new Date().toISOString()
      })
      .eq("id", dispatchId)
      .eq("assigned_rider_id", riderId)
      .select();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No matching active dispatch record found for this transaction context." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Delivery transport status transition processed atomically.",
      updatedRecord: data
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
