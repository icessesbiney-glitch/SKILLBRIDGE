import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminClient, authenticate } from '../_lib/auth';

// Roles a user may pick for themselves; admin roles are never self-assignable.
const SELF_SERVICE_ROLES = ['customer', 'vendor_micro', 'vendor_elite', 'driver_rider'];

export async function POST(req: Request) {
  try {
    const auth = await authenticate(req);
    if ('error' in auth) return auth.error;
    const supabase = adminClient();
    const idSecret = process.env.NATIONAL_ID_HASH_SECRET;
    if (!supabase || !idSecret) {
      return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 });
    }

    const { fullName, phoneNumber, ghanaCardPin, roleTier } = await req.json();
    if (!fullName || !phoneNumber || !ghanaCardPin || !roleTier) {
      return NextResponse.json({ error: 'Incomplete payload attributes.' }, { status: 400 });
    }
    if (!SELF_SERVICE_ROLES.includes(roleTier)) {
      return NextResponse.json({ error: 'Invalid role selection.' }, { status: 400 });
    }

    const profileId = auth.user.id;
    const { data: existing } = await supabase.from('profiles').select('role_tier').eq('id', profileId).maybeSingle();
    if (existing?.role_tier === 'admin_central') {
      return NextResponse.json({ error: 'Admin profiles cannot be modified here.' }, { status: 403 });
    }

    // Keyed hash: a plain SHA-256 of a short ID number is trivially brute-forced.
    const nationalIdHash = crypto.createHmac('sha256', idSecret).update(String(ghanaCardPin)).digest('hex');

    // Verification stays 'pending' until an admin approves the record.
    const { error: dbError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: profileId,
          legal_name: String(fullName).slice(0, 200),
          phone_number: String(phoneNumber).slice(0, 30),
          role_tier: roleTier,
          national_id_hash: nationalIdHash,
        },
        { onConflict: 'id' }
      );

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Submitted for verification.' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Onboarding failed.' }, { status: 500 });
  }
}
