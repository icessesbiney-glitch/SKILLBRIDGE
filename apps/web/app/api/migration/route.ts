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
    console.log(`[COMPLIANCE] Generated secure identification validation hash for: ${fullName}`);

    // If keys are unconfigured or database is waking up, use a local data fallback to allow local form execution
    if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey.includes('your_live')) {
      console.warn('[SUPABASE WARNING] Missing or unconfigured environment variables. Using sandbox response.');
      return NextResponse.json({ success: true, message: 'Sandbox processing complete.' }, { status: 200 });
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
      console.error('[SUPABASE DB ERROR]', dbError);
      return NextResponse.json({ error: 'Database record insertion rejected.', details: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Onboarding records securely processed.' }, { status: 200 });
  } catch (error: any) {
    console.error('[MIGRATION ENDPOINT ERROR]', error);
    return NextResponse.json({ error: 'Internal serverless processing exception.' }, { status: 500 });
  }
}
