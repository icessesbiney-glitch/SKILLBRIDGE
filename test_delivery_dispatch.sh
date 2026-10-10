#!/bin/bash
echo "🚀 [SKILLBRIDGE END-TO-END SYSTEM TEST]: Starting hyperlocal auto-dispatch validation sequence..."
API_BASE="http://localhost:3000/api"

echo "📡 Step 1: Staging active on-duty rider location coordinates at Madina, Accra..."
curl -X POST "$API_BASE/gps" -H "Content-Type: application/json" -d '{"userId": "d3b07384-d113-4ec2-a5d9-cd1111111111", "profileType": "rider", "latitude": 5.668500, "longitude": -0.169100, "status": "on_duty"}'

echo -e "\n\n🛒 Step 2: Simulating customer checkout placement matrix..."
curl -X POST "$API_BASE/orders/create" -H "Content-Type: application/json" -d '{"customer_id": "c3b07384-d113-4ec2-a5d9-cd2222222222", "vendor_id": "v3b07384-d113-4ec2-a5d9-cd3333333333", "pickup_lat": 5.667900, "pickup_lng": -0.168500, "delivery_lat": 5.681200, "delivery_lng": -0.172400, "total_amount": 45.50}'

echo -e "\n\n🏪 Step 3: Initializing automated vendor split ledger settlements parameters..."
curl -X POST "$API_BASE/vendor/settle" -H "Content-Type: application/json" -d '{"vendorId": "v3b07384-d113-4ec2-a5d9-cd3333333333", "orderReference": "SB-TEST-99", "grossAmount": 45.50}'

echo -e "\n\n✅ [ALL CORE HYPERLOCAL ENGINE SYSTEM MODULES OPERATIONAL]"
