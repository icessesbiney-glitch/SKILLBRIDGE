#!/bin/bash
echo "=== SIMULATING LIVE ACCRA GEOSPATIAL TELEMETRY UPDATE ==="

TELEMETRY_URL="http://localhost:3000/api/rider/telemetry"

# Construct coordinate parameters tracking through Ga East / Legon boundaries
PAYLOAD='{
  "riderId": "00000000-0000-0000-0000-000000000999",
  "latitude": 5.660144,
  "longitude": -0.174112,
  "bearing": 184.50,
  "speedKmh": 42.80,
  "currentStatus": "on_delivery"
}'

echo "[TEST] Posting real-time coordinate data to local serverless route..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$TELEMETRY_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "[RESULT] Telemetry payload transmission complete. Response Code: $HTTP_CODE"
if [ "$HTTP_CODE" -eq 200 ]; then
  echo ">>> SUCCESS: Positioning telemetry synchronized completely."
else
  echo ">>> FAILURE: Route offline or internal parameter validation rejection."
fi
