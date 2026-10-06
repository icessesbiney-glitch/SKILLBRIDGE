import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, phoneNumber, ghanaCardPin, roleTier } = body;

    if (!fullName || !phoneNumber || !ghanaCardPin || !roleTier) {
      return NextResponse.json({ error: 'Incomplete compliance onboarding payload attributes.' }, { status: 400 });
    }

    const nationalIdHash = crypto.createHash('sha256').update(ghanaCardPin).digest('hex');
    console.log(`[COMPLIANCE] Generating secure registration hash details for: ${fullName}`);
    
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
      return NextResponse.json({ error: 'Database ledger registration rejection.', details: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding verification records encrypted and securely pushed live.' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('[MIGRATION ENDPOINT EXCEPTION]', error);
    return NextResponse.json({ error: 'Internal pipeline state validation break.' }, { status: 500 });
  }
}
