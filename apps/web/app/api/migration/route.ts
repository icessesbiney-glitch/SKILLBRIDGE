import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize a secure backend database connection using environment parameters
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Live Production Compliance Data Ingestion Endpoints
 * Target Route: /api/migration
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, phoneNumber, ghanaCardPin, roleTier } = body;

    // 1. Enforce rigorous server-side structural data verification limits
    if (!fullName || !phoneNumber || !ghanaCardPin || !roleTier) {
      return NextResponse.json({ error: 'Incomplete registration compliance dataset attributes.' }, { status: 400 });
    }

    // 2. Anonymize national ID values cryptographically to protect data privacy
    const nationalIdHash = crypto
      .createHash('sha256')
      .update(ghanaCardPin)
      .digest('hex');

    console.log(`[LIVE COMPLIANCE HANDSHAKE] Registering legal profile: ${fullName}`);

    // 3. Map values directly into your isolated Supabase marketplace schema layer
    const { error: dbError } = await supabase
      .from('profiles')
      .insert([
        {
          legal_name: fullName,
          phone_number: phoneNumber,
          role_tier: roleTier,
          national_id_hash: nationalIdHash,
          verification: 'pending'
        }
      ]);

    if (dbError) {
      console.error('[DATABASE INSERTION FAILURE]', dbError);
      return NextResponse.json({ error: 'Database ledger registration rejection.', details: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding compliance validation record successfully encrypted and securely pushed live.' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('[MIGRATION PIPELINE CRASH]', error);
    return NextResponse.json({ error: 'Internal serverless runtime execution break.' }, { status: 500 });
  }
}
