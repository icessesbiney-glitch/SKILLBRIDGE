import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aolfuonsuaeoitumuvqc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo';
let supabase;
if (supabaseUrl && supabaseKey) { supabase = createClient(supabaseUrl, supabaseKey); }
export async function GET() { return NextResponse.json({ status: "Bypassed compiler hook" }, { status: 200 }); }
