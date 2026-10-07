#!/bin/bash
echo "=============================================================================="
echo "⚠️  SKILLBRIDGE ECOSYSTEM - DATABASE SANITATION RUNNER"
echo "=============================================================================="
read -p "Are you absolutely sure you want to wipe all local mock test entries? (y/n): " confirm

if [ "$confirm" = "y" ]; then
    echo "[DB] Purging local simulation entries across parallel tables safely..."
    docker exec -i supabase_db_SKILLBRIDGE psql -U postgres -d postgres -c "
        TRUNCATE TABLE public.delivery_location_tracking CASCADE;
        TRUNCATE TABLE public.user_course_progress CASCADE;
        TRUNCATE TABLE public.platform_revenue_ledger CASCADE;
        UPDATE public.platform_wallets SET balance_cents = 0;
    "
    echo "✅ SUCCESS: Database has been cleared and prepped for real production launch users!"
else
    echo "❌ Operation cancelled. Local test data remains intact."
fi
