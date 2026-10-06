#!/bin/bash
echo "=== SPINNING UP LIVE PAYSTACK WEBHOOK HANDSHAKE SIMULATION ==="

CURRENT_TIMESTAMP=$(date +%s)

# Define a mock successful transaction payload matching the Paystack gateway criteria
MOCK_EVENT=$(cat << INNER_EOF
{
  "event": "charge.success",
  "data": {
    "reference": "SKILLBRIDGE_TXN_${CURRENT_TIMESTAMP}",
    "amount": 15000,
    "customer": {
      "email": "0241234567"
    }
  }
}
INNER_EOF
)

# Compute a dummy validation signature pattern using sha512
DUMMY_SIGNATURE=$(echo -n "$MOCK_EVENT" | openssl dgst -sha512 -hmac "your_live_paystack_secret_key" | sed "s/(stdin)= //")

echo "[TEST RUNNER] Submitting mock transaction payload to endpoint..."

# Execute the local cross-origin handshake call directly to your active dev environment port (3001)
curl -X POST http://localhost:3001/api/paystack-webhook \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: $DUMMY_SIGNATURE" \
  -d "$MOCK_EVENT" \
  -w "\n=== WEBHOOK HTTP RESPONSE CODE: %{http_code} ===\n"

echo "=== HANDSHAKE SIMULATION TERMINATED ==="
