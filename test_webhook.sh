#!/bin/bash
echo "=== SPINNING UP LIVE PAYSTACK WEBHOOK HANDSHAKE SIMULATION ==="
CURRENT_TIMESTAMP=$(date +%s)
MOCK_EVENT=$(cat << INNER_EOF
{
  \"event\": \"charge.success\",
  \"data\": {
    \"reference\": \"SKILLBRIDGE_TXN_${CURRENT_TIMESTAMP}\",
    \"amount\": 15000,
    \"customer\": { \"email\": \"0241234567\" }
  }
}
INNER_EOF
)
DUMMY_SIGNATURE=$(echo -n "\$MOCK_EVENT" | openssl dgst -sha512 -hmac "your_live_paystack_secret_key" | sed "s/(stdin)= //")
echo "[TEST RUNNER] Submitting mock transaction payload to endpoint..."
curl -X POST http://localhost:3003/api/paystack-webhook -H "Content-Type: application/json" -H "x-paystack-signature: \$DUMMY_SIGNATURE" -d "\$MOCK_EVENT" -w "\n=== WEBHOOK HTTP RESPONSE CODE: %{http_code} ===\n"
echo "=== HANDSHAKE SIMULATION TERMINATED ==="