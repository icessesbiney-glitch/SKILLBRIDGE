import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface OrderCreationPayload {
  customer_id: string;
  vendor_id: string;
  pickup_lat: number;
  pickup_lng: number;
  delivery_lat: number;
  delivery_lng: number;
  total_amount: number;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    const body: OrderCreationPayload = await request.json();
    const { customer_id, vendor_id, pickup_lat, pickup_lng, delivery_lat, delivery_lng, total_amount } = body;

    // Validate incoming transaction metadata fields
    if (!customer_id || !vendor_id || !pickup_lat || !pickup_lng || !delivery_lat || !delivery_lng) {
      return NextResponse.json({ error: 'Missing critical order initialization parameters' }, { status: 400 });
    }

    // Generate a unique alpha-numeric string index reference code for local compliance identification
    const trackingReference = `SB-${Math.floor(100000 + Math.random() * 900000)}`;

    console.log(`[CHECKOUT ENGINE] Creating order reference: ${trackingReference}. Initializing auto-dispatch loop trigger...`);

    // Insert order entry row into the database. This instantly fires your public.trigger_auto_dispatch_matching_loop database trigger!
    const { data: newOrder, error: orderError } = await supabase
      .from('delivery_orders')
      .insert([
        {
          order_reference: trackingReference,
          customer_id: customer_id,
          vendor_id: vendor_id,
          pickup_latitude: pickup_lat,
          pickup_longitude: pickup_lng,
          delivery_latitude: delivery_lat,
          delivery_longitude: delivery_lng,
          order_total: total_amount || 0.00
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Check if the database trigger instantly matched and assigned a rider within the 5km cell matrix
    const { data: assignmentData } = await supabase
      .from('delivery_assignments')
      .select('id, rider_profile_id, assignment_status')
      .eq('order_id', newOrder.id)
      .single();

    return NextResponse.json({
      success: true,
      message: 'Checkout processing completed and auto-dispatch loop executed cleanly.',
      order: newOrder,
      assignment: assignmentData || 'Searching for available on-duty riders within 5km bounding cell...'
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
