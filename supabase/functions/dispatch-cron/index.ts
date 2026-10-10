import { serve } from "https://deno.land"
import { createClient } from "https://esm.sh"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const { data, error } = await supabase.rpc('check_and_process_expired_delivery_dispatches', { timeout_threshold_seconds: 30 })
    if (error) throw error
    return new Response(JSON.stringify({ success: true, processed: data?.processed_assignment_count ?? 0 }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, status: 200 })
  } catch (err: any) { return new Response(JSON.stringify({ error: err.message }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, status: 500 }) }
})
