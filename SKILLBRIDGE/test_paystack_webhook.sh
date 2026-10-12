#!/bin/bash
echo "=== EXECUTING MINIFIED LOCAL PAYSTACK WEBHOOK EVENT SIMULATION ==="

WEBHOOK_URL="http://localhost:3000/api/paystack-webhook"
WEBHOOK_SECRET="${PAYSTACK_WEBHOOK_SECRET}"
MOCK_REF="WITHDRAW_TXN_$(date +%s)"

echo "[SETUP] Target Transaction Reference: $MOCK_REF"

# Seed a matching database context transaction row before firing the payload
docker exec -i supabase_db_SKILLBRIDGE psql -U postgres -d postgres -c "
INSERT INTO public.wallet_transactions (reference_id, profile_id, amount_cents, status, channel, created_at)
VALUES ('$MOCK_REF', '00000000-0000-0000-0000-000000000137', 7500, 'pending', 'mobile_money', NOW())
ON CONFLICT DO NOTHING;
" 2>/dev/null

# Construct a single-line minified JSON payload block to prevent white-space mismatching
PAYLOAD='{"event":"transfer.success","data":{"reference":"'"$MOCK_REF"'","amount":7500,"currency":"GHS","recipient":{"recipient_code":"RCP_mock123xyz","name":"Joshua Biney"}}}'

# Compute the signature securely against the minified row parameters
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha512 -hmac "$WEBHOOK_SECRET" | awk '{print $2}')

echo "[TEST] Firing cryptographic signature validation payload..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "x-paystack-signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "[RESULT] Handshake terminated with Server Response Code: $HTTP_CODE"
if [ "$HTTP_CODE" -eq 200 ]; then
  echo ">>> SUCCESS: Paystack webhook event authenticated and processed natively."
else
  echo ">>> FAILURE: Signature mismatch or route endpoint server offline."
fi
