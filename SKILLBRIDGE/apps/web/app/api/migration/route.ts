import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, fullName, phoneNumber, ghanaCardPin, roleTier } = body;

    if (
      typeof id !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) ||
      typeof fullName !== 'string' ||
      typeof phoneNumber !== 'string' ||
      typeof ghanaCardPin !== 'string' ||
      typeof roleTier !== 'string'
    ) {
      return NextResponse.json({ error: 'Incomplete payload attributes.' }, { status: 400 });
    }

    const nationalIdHash = crypto.createHash('sha256').update(ghanaCardPin).digest('hex');
    console.log(`[COMPLIANCE] Generated secure ID verification hash for user: ${fullName}`);

    if (!supabase) {
      return NextResponse.json({ error: 'Identity verification service is not configured.' }, {
        status: 503,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    const { error: dbError } = await supabase
      .from('profiles')
      .upsert({
        id,
        legal_name: fullName,
        phone_number: phoneNumber,
        role_tier: roleTier,
        national_id_hash: nationalIdHash,
        verification: 'verified'
      }, { onConflict: 'id' });

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Processed successfully.' }, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Identity verification failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
