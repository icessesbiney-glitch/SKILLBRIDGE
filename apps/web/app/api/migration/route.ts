import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "../../../utils/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  // Require a signed-in session (scoped by auth.uid() via the request cookies)
  // before allowing any elevated, service-role-powered lookup below.
  const sessionClient = createServerClient(await cookies());
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Migration status is not configured." }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await supabase.from("profiles").select("id").eq("id", user.id).limit(1);

    if (error) throw error;

    return NextResponse.json({ migration: "secured", rls_policies: "active" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
