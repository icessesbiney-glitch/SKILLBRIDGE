#!/bin/bash
echo "=== SPINNING UP LOCAL CASHOUT DISBURSEMENT SIMULATION ==="

# 1. Test an invalid transaction payload below the 50 GHS boundary (e.g., 20 GHS)
echo "[TEST 1] Testing rejection threshold limits (Sending 20.00 GHS)..."
curl -X POST http://localhost:3003/api/withdraw \
  -H "Content-Type: application/json" \
  -d '{"profileId":"137","requestedAmountCents":2000,"payoutMethod":"mobile_money"}' \
  -w "\nHTTP CODE: %{http_code}\n\n"

# 2. Test a valid transaction payload meeting the 50 GHS boundary (e.g., 75 GHS)
echo "[TEST 2] Testing validation path rules (Sending 75.00 GHS)..."
curl -X POST http://localhost:3003/api/withdraw \
  -H "Content-Type: application/json" \
  -d '{"profileId":"137","requestedAmountCents":7500,"payoutMethod":"mobile_money"}' \
  -w "\nHTTP CODE: %{http_code}\n"

echo "=== DISBURSEMENT SIMULATION LIFECYCLE TERMINATED ==="
