#!/bin/bash
echo "=============================================================================="
echo "💰 SKILLBRIDGE MARKETPLACE - PLATFORM REVENUE & PROVAL BALANCES"
echo "=============================================================================="
echo ""

# Query total accumulated platform metrics securely out of your container instance
TOTAL_REVENUE_CENTS=$(docker exec -i supabase_db_SKILLBRIDGE psql -U postgres -d postgres -t -c "
  SELECT COALESCE(SUM(commission_earned_cents), 0) FROM public.platform_revenue_ledger;
" | tr -d '[:space:]')

TOTAL_GROSS_CENTS=$(docker exec -i supabase_db_SKILLBRIDGE psql -U postgres -d postgres -t -c "
  SELECT COALESCE(SUM(gross_amount_cents), 0) FROM public.platform_revenue_ledger;
" | tr -d '[:space:]')

# Compute currency transformations cleanly using standard built-in awk matrix
REVENUE_GHS=$(awk "BEGIN {printf \"%.2f\", $TOTAL_REVENUE_CENTS / 100}")
GROSS_GHS=$(awk "BEGIN {printf \"%.2f\", $TOTAL_GROSS_CENTS / 100}")

echo "📊 FINANCIAL METRICS OVERVIEW:"
echo "------------------------------------------------------------------------------"
echo "🛒 Total Gross Marketplace Volume (GMV):   $GROSS_GHS GHS"
echo "🚀 Total Accumulated Platform Net Profit:  $REVENUE_GHS GHS"
echo "------------------------------------------------------------------------------"
echo ""
echo "📝 ITEMIZED REVENUE TRANSACTION JOURNAL HISTORY:"
echo "------------------------------------------------------------------------------"
docker exec -i supabase_db_SKILLBRIDGE psql -U postgres -d postgres -c "
  SELECT 
    order_id as \"Order Identification Ref\",
    gross_amount_cents/100.0 as \"Gross Vol (GHS)\",
    commission_earned_cents/100.0 as \"Platform Cut (GHS)\",
    vendor_payout_cents/100.0 as \"Vendor Share (GHS)\",
    processed_at as \"Settlement Timestamp\"
  FROM public.platform_revenue_ledger
  ORDER BY processed_at DESC;
"
echo "=============================================================================="
