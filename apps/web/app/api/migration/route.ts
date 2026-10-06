import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const { fullName, phoneNumber, ghanaCardPin, roleTier } = body;

    if (!fullName || !phoneNumber || !ghanaCardPin || !roleTier) {
      return NextResponse.json({ error: 'Incomplete compliance attributes.' }, { status: 400 });
    }

    const nationalIdHash = crypto.createHash('sha256').update(ghanaCardPin).digest('hex');
    console.log(`[COMPLIANCE] Hashed record for: ${fullName}`);

    if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey.includes('your_supabase')) {
      return NextResponse.json({ success: true, message: 'Sandbox bypass success.' }, {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    const { error: dbError } = await supabase
      .from('profiles')
      .insert([{
        legal_name: fullName,
        phone_number: phoneNumber,
        role_tier: roleTier,
        national_id_hash: nationalIdHash,
        verification: 'pending'
      }]);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Processed successfully.' }, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
