import { NextResponse } from "next/server";
import { createClient, type User } from "@supabase/supabase-js";

export function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

type AuthResult = { user: User } | { error: NextResponse };

// Resolves the caller from their Supabase access token; never trust ids sent in the request body.
export async function authenticate(req: Request): Promise<AuthResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) {
    return { error: NextResponse.json({ error: "Server is not configured." }, { status: 500 }) };
  }
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  }
  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authorization } },
  });
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    return { error: NextResponse.json({ error: "Invalid or expired session." }, { status: 401 }) };
  }
  return { user: data.user };
}

export async function isAdmin(userId: string): Promise<boolean> {
  const admin = adminClient();
  if (!admin) return false;
  const { data } = await admin.from("profiles").select("role_tier").eq("id", userId).single();
  return data?.role_tier === "admin_central";
}
