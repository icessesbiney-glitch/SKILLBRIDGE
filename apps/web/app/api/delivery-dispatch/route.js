import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        
        const deliveryId = body.deliveryId || null;
        const riderId = body.rider_id || null;
        const status = body.status || null;
        
        const tracking = body.tracking ? {
            latitude: parseFloat(body.tracking.latitude) || null,
            longitude: parseFloat(body.tracking.longitude) || null,
            heading: parseFloat(body.tracking.heading) || 0,
            speed: parseFloat(body.tracking.speed) || 0
        } : null;

        const payment = body.payment ? {
            reference: body.payment.reference || null,
            status: body.payment.status || "unpaid",
            amountGHS: parseFloat(body.payment.amount_ghs) || 0
        } : null;

        if (!deliveryId || !riderId) {
            return NextResponse.json({
                success: false,
                error: "Missing parameters: deliveryId and rider_id are required."
            }, { status: 422 });
        }

        return NextResponse.json({
            success: true,
            received: true,
            meta: { deliveryId, riderId, status, syncTime: new Date().toISOString() },
            tracking,
            payment
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            error: "Ingestion Parser Exception: " + error.message
        }, { status: 500 });
    }
}