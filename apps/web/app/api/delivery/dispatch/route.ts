import { NextResponse } from 'next/server';
import { adminClient, authenticate } from '../../_lib/auth';

export async function POST(req: Request) {
  try {
    const auth = await authenticate(req);
    if ('error' in auth) return auth.error;
    const supabase = adminClient();
    if (!supabase) return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 });

    const body = await req.json();
    const { dispatchId, nextStatus } = body;
    const riderId = auth.user.id;

    if (!dispatchId || typeof nextStatus !== 'string') {
      return NextResponse.json(
        { error: 'Missing required dispatch operation attributes.' },
        { status: 400 }
      );
    }

    const { data, error: updateError } = await supabase
      .from('delivery_dispatches')
      .update({
        payload_status: nextStatus,
        assignment_timestamp: new Date().toISOString()
      })
      .eq('id', dispatchId)
      .eq('assigned_rider_id', riderId)
      .select();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No matching active dispatch record found for this transaction context.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Delivery transport status transition processed atomically.',
      updatedRecord: data
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
