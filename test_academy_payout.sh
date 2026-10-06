#!/bin/bash
echo "=== EXECUTING LOCAL ACADEMY AUTOMATED PAYOUT SIMULATION ==="

# 1. Verify current wallet balance baseline state for our target test profile
echo "[CHECK] Fetching initial wallet vault balance before quiz submission..."
docker exec -i supabase_db_SKILLBRIDGE psql -U postgres -d postgres -c "
  SELECT profile_id, balance_cents FROM public.platform_wallets 
  WHERE profile_id = '00000000-0000-0000-0000-000000000137';
"

echo "[TEST] Simulating successful quiz completion entry..."
# 2. Insert or update a course row to completed to trigger your database function automatically
docker exec -i supabase_db_SKILLBRIDGE psql -U postgres -d postgres -c "
  INSERT INTO public.user_course_progress (profile_id, course_id, is_completed, quiz_score, completed_at)
  VALUES (
    '00000000-0000-0000-0000-000000000137', 
    '00000000-0000-0000-0000-0000000000a1', 
    true, 
    95, 
    NOW()
  )
  ON CONFLICT (profile_id, course_id) 
  DO UPDATE SET is_completed = true, quiz_score = 95, completed_at = NOW();
"

echo ""
echo "[VERIFICATION] Fetching updated wallet vault balance..."
# 3. Read the wallet record again to check if the cash reward was automatically added
docker exec -i supabase_db_SKILLBRIDGE psql -U postgres -d postgres -c "
  SELECT profile_id, balance_cents FROM public.platform_wallets 
  WHERE profile_id = '00000000-0000-0000-0000-000000000137';
"
echo "=== ACADEMY BALANCE VERIFICATION LOOP COMPLETE ==="
