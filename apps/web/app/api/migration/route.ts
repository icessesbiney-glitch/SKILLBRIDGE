import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminClient, authenticate } from '../_lib/auth';
import { readRequestBody, RequestBodyTooLargeError } from '../_lib/request-body';

// Roles a user may pick for themselves; admin roles are never self-assignable.
const SELF_SERVICE_ROLES = ['customer', 'vendor_micro', 'vendor_elite'];

export async function POST(req: Request) {
  try {
    const auth = await authenticate(req);
    if ('error' in auth) return auth.error;
    const supabase = adminClient();
    const idSecret = process.env.NATIONAL_ID_HASH_SECRET;
    if (!supabase || !idSecret) {
      return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 });
    }

    let body: unknown;
    try {
      body = JSON.parse(new TextDecoder().decode(await readRequestBody(req, 16_384)));
    } catch (error) {
      if (error instanceof RequestBodyTooLargeError) {
        return NextResponse.json({ error: 'Request body is too large.' }, { status: 413 });
      }
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }
    const { fullName, phoneNumber, ghanaCardPin, roleTier } = body ?? {};
    if (
      typeof fullName !== 'string' ||
      typeof phoneNumber !== 'string' ||
      typeof ghanaCardPin !== 'string' ||
      typeof roleTier !== 'string'
    ) {
      return NextResponse.json({ error: 'Incomplete payload attributes.' }, { status: 400 });
    }
    const normalizedName = fullName.trim();
    const normalizedPhone = phoneNumber.replace(/[\s-]/g, '');
    const normalizedCardPin = ghanaCardPin.trim().toUpperCase();
    if (!normalizedName || normalizedName.length > 200) {
      return NextResponse.json({ error: 'Enter a valid full name.' }, { status: 400 });
    }
    if (!/^(?:\+?233|0)\d{9}$/.test(normalizedPhone)) {
      return NextResponse.json({ error: 'Enter a valid Ghana phone number.' }, { status: 400 });
    }
    if (!/^GHA-\d{9}-\d$/.test(normalizedCardPin)) {
      return NextResponse.json({ error: 'Enter a valid Ghana Card PIN.' }, { status: 400 });
    }
    if (!SELF_SERVICE_ROLES.includes(roleTier)) {
      return NextResponse.json({ error: 'Invalid role selection.' }, { status: 400 });
    }

    const profileId = auth.user.id;
    const { data: existing, error: existingError } = await supabase
      .from('profiles')
      .select('role_tier')
      .eq('id', profileId)
      .maybeSingle();
    if (existingError) {
      console.error('Unable to verify the existing onboarding profile.', existingError);
      return NextResponse.json({ error: 'Account verification could not be completed.' }, { status: 500 });
    }
    if (existing?.role_tier === 'admin_central') {
      return NextResponse.json({ error: 'Admin profiles cannot be modified here.' }, { status: 403 });
    }

    // Keyed hash: a plain SHA-256 of a short ID number is trivially brute-forced.
    const nationalIdHash = crypto.createHmac('sha256', idSecret).update(normalizedCardPin).digest('hex');

    // Verification stays 'pending' until an admin approves the record.
    const { error: dbError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: profileId,
          legal_name: normalizedName,
          phone_number: normalizedPhone,
          role_tier: roleTier,
          national_id_hash: nationalIdHash,
          verification: 'pending',
        },
        { onConflict: 'id' }
      );

    if (dbError) {
      console.error('Unable to save onboarding details.', dbError);
      return NextResponse.json({ error: 'Onboarding could not be saved.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Submitted for administrator review.' }, { status: 200 });
  } catch (error) {
    console.error('Unexpected onboarding failure.', error);
    return NextResponse.json({ error: 'Onboarding failed.' }, { status: 500 });
  }
}
