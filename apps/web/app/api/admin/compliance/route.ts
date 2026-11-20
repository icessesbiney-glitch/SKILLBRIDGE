import { NextResponse } from 'next/server';
import { adminClient, authenticate, isAdmin } from '../../_lib/auth';

const PROFILE_FIELDS = 'id, legal_name, phone_number, role_tier, verification, created_at';
const VERIFICATION_STATUSES = ['verified', 'suspended'] as const;

type AdminAccess =
  | { authorized: true; supabase: NonNullable<ReturnType<typeof adminClient>> }
  | { authorized: false; response: NextResponse };

async function authorizedAdmin(request: Request): Promise<AdminAccess> {
  const auth = await authenticate(request);
  if ('error' in auth) return { authorized: false, response: auth.error };
  if (!(await isAdmin(auth.user.id))) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Admin access required.' }, { status: 403 }),
    };
  }
  const supabase = adminClient();
  if (!supabase) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Server is not configured.' }, { status: 503 }),
    };
  }
  return { authorized: true, supabase };
}

export async function GET(request: Request): Promise<NextResponse> {
  const access = await authorizedAdmin(request);
  if (!access.authorized) return access.response;

  const { data, error } = await access.supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Unable to load compliance profiles.', error);
    return NextResponse.json({ error: 'Unable to load verification records.' }, { status: 503 });
  }

  return NextResponse.json({ profiles: data ?? [] });
}

export async function POST(request: Request): Promise<NextResponse> {
  const access = await authorizedAdmin(request);
  if (!access.authorized) return access.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid verification request.' }, { status: 400 });
  }

  const { profileId, verification } = body as {
    profileId?: unknown;
    verification?: unknown;
  };
  if (
    typeof profileId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId) ||
    typeof verification !== 'string' ||
    !VERIFICATION_STATUSES.includes(verification as (typeof VERIFICATION_STATUSES)[number])
  ) {
    return NextResponse.json({ error: 'Invalid verification request.' }, { status: 400 });
  }

  const { data, error } = await access.supabase
    .from('profiles')
    .update({ verification })
    .eq('id', profileId)
    .eq('verification', 'pending')
    .select(PROFILE_FIELDS)
    .maybeSingle();

  if (error) {
    console.error('Unable to update verification status.', error);
    return NextResponse.json({ error: 'Unable to update verification status.' }, { status: 503 });
  }
  if (!data) {
    return NextResponse.json(
      { error: 'This profile is no longer pending review.' },
      { status: 409 },
    );
  }

  return NextResponse.json({ profile: data });
}
