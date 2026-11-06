#!/bin/bash
echo "=== SPINNING UP LOCAL CASHOUT DISBURSEMENT SIMULATION ==="

# 1. Test an invalid transaction payload below the 50 GHS boundary (e.g., 20 GHS)
echo "[TEST 1] Testing rejection threshold limits (Sending 20.00 GHS)..."
curl -X POST http://localhost:3000/api/cashout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TEST_ACCESS_TOKEN:?Set TEST_ACCESS_TOKEN to a signed-in user access token}" \
  -d '{"amount":20,"bankCode":"MTN","accountNumber":"0241234567","accountName":"Test User"}' \
  -w "\nHTTP CODE: %{http_code}\n\n"

# 2. Test a valid transaction payload meeting the 50 GHS boundary (e.g., 75 GHS)
echo "[TEST 2] Testing validation path rules (Sending 75.00 GHS)..."
curl -X POST http://localhost:3000/api/cashout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TEST_ACCESS_TOKEN:?Set TEST_ACCESS_TOKEN to a signed-in user access token}" \
  -d '{"amount":75,"bankCode":"MTN","accountNumber":"0241234567","accountName":"Test User"}' \
  -w "\nHTTP CODE: %{http_code}\n"

echo "=== DISBURSEMENT SIMULATION LIFECYCLE TERMINATED ==="
