import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const signature = request.headers.get('x-paystack-signature');
        if (!signature) return NextResponse.json({ error: 'Missing Signature' }, { status: 401 });

        const payloadText = await request.text();
        
        const secret = process.env.PAYSTACK_SECRET || 'sk_test_1234567890abcdef1234567890abcdef';
        const hash = crypto.createHmac('sha512', secret).update(payloadText).digest('hex');

        if (signature !== hash) {
            return NextResponse.json({ error: 'Invalid Signature Match' }, { status: 401 });
        }

        const payload = JSON.parse(payloadText);
        const amountPaid = payload?.data?.amount;

        const targetWalletUuid = crypto.randomUUID();
        const validUuidTrackingReference = crypto.randomUUID();

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl) {
            return NextResponse.json({ received: true, synchronized: false, error: 'Missing Target DB URL' }, { status: 200 });
        }

        const targetEndpoint = supabaseUrl + '/rest/v1/wallet_transactions';
        const dbResponse = await fetch(targetEndpoint, {
            method: 'POST',
            headers: {
                'apikey': serviceKey,
                'Authorization': 'Bearer ' + serviceKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                wallet_id: targetWalletUuid,
                reference_id: validUuidTrackingReference,
                amount: amountPaid
            })
        });

        if (!dbResponse.ok) {
            const dbErrorText = await dbResponse.text();
            return NextResponse.json({ 
                received: true, 
                synchronized: false, 
                database_status: 'SCHEMA_OR_CONNECTION_ERROR', 
                details: dbErrorText 
            }, { status: 200 });
        }

        return NextResponse.json({ received: true, synchronized: true }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Error', details: error.message }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-paystack-signature'
        }
    });
}
