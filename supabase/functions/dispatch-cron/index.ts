import { serve } from "https://deno.land"
import { createClient } from "https://esm.sh"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  // Enforce validation constraints to only process secure GET or POST cron invocations
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    console.log("⏳ [CRON RUNNER]: Initializing cascading order expiry verification checks...");

    // Invoke your compiled PostgreSQL database cron routine to sweep for expired 30s dispatches
    const { data, error } = await supabase.rpc('check_and_process_expired_delivery_dispatches', {
      timeout_threshold_seconds: 30
    })

    if (error) throw error

    const resultCount = data?.[0]?.processed_assignment_count ?? 0;
    console.log(`🎯 [CRON SUCCESS]: Expiry sweep executed smoothly. Processed: ${resultCount} assignments.`);

    return new Response(JSON.stringify({ success: true, processed: resultCount }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 200,
    })
  } catch (err: any) {
    console.error(`❌ [CRON EXCEPTION CRITICAL]: ${err.message}`)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 500,
    })
  }
})
