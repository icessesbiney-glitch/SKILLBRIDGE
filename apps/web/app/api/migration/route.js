import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aolfuonsuaeoitumuvqc.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo";

    const supabase = createClient(supabaseUrl, supabaseKey);
    return NextResponse.json({ status: "migration_layer_ready", active: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
