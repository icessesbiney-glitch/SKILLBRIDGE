import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface DispatchPayload {
  orderId: string;
  pickupLat: number;
  pickupLng: number;
  maxRadiusMeters?: number;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    const body: DispatchPayload = await request.json();
    const { orderId, pickupLat, pickupLng, maxRadiusMeters = 5000 } = body;

    if (!orderId || !pickupLat || !pickupLng) {
      return NextResponse.json({ error: 'Missing critical order location matrices fields' }, { status: 400 });
    }

    addConsoleLog(`📡 Dispatch request received for Order ID: ${orderId}. Matching closest fleet unit...`);

    // 1. Invoke the RPC PostGIS matching query function compiled inside the database instance
    const { data: matchedRider, error: matchingError } = await supabase
      .rpc('match_closest_delivery_rider', {
        target_order_id: orderId,
        pickup_lat: pickupLat,
        pickup_lng: pickupLng,
        max_radius_meters: maxRadiusMeters
      });

    if (matchingError) throw matchingError;

    if (!matchedRider || matchedRider.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No available on-duty riders found inside this 5km hyperlocal cell grid boundary.' 
      }, { status: 444 });
    }

    const targetRider = matchedRider[0];
    addConsoleLog(`🎯 Closest match isolated: Rider Profile ID ${targetRider.matched_rider_profile_id} at a distance of ${targetRider.calculated_distance_meters.toFixed(2)} meters.`);

    // 2. Insert the entry record payload into the real-time order assignment matrix table
    const { data: assignment, error: assignmentError } = await supabase
      .from('delivery_assignments')
      .insert([
        {
          order_id: orderId,
          rider_profile_id: targetRider.matched_rider_profile_id,
          assignment_status: 'pending',
          rejection_count_at_assignment: 0
        }
      ])
      .select()
      .single();

    if (assignmentError) throw assignmentError;

    return NextResponse.json({ 
      success: true, 
      message: 'Hyperlocal order matching allocation completed cleanly.', 
      assignment 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function addConsoleLog(msg: string) {
  console.log(`[DISPATCH ENGINE] [${new Date().toISOString()}] ${msg}`);
}
