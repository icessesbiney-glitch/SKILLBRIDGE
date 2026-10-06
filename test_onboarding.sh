#!/bin/bash
# =========================================================================
# SKILLBRIDGE COMPLIANCE API HANDSHAKE TEST LOOP
# =========================================================================
echo "=== SPINNING UP LOCAL PAYLOAD HANDSHAKE SIMULATION ==="

# Define a mock JSON payload structured exactly like your Ghana Card form variables
MOCK_PAYLOAD=$(cat << 'INNER_EOF'
{
  "fullName": "Joshua Biney",
  "phoneNumber": "0241234567",
  "ghanaCardPin": "GHA-719385024-5",
  "roleTier": "vendor_micro"
}
INNER_EOF
)

# Trigger an absolute curl request straight to your Next.js local serverless engine
curl -X POST http://localhost:3000/api/migration \
  -H "Content-Type: application/json" \
  -d "$MOCK_PAYLOAD" \
  -w "\n=== HANDSHAKE HTTP RESPONSE CODE: %{http_code} ===\n"

echo "=== HANDSHAKE VERIFICATION LOOP TERMINATED ==="
