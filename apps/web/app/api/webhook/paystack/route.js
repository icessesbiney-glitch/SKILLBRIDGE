import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const payload = await request.json();
        const signature = request.headers.get('x-paystack-signature');
        
        console.log("?? [Paystack Webhook Received]");
        console.log("Reference:", payload?.data?.reference);
        console.log("Signature Received:", signature);

        // Success handshake response back to Paystack
        return NextResponse.json({ received: true, status: "success" }, { status: 200 });
    } catch (error) {
        console.error("? Webhook Parse Error:", error);
        return NextResponse.json({ error: "Invalid Payload" }, { status: 400 });
    }
}

// Explicitly handle options requests if needed for preflights
export async function OPTIONS() {
    return new Response(null, { status: 200 });
}
