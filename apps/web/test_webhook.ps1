$ErrorActionPreference = 'Stop'

$secret = $env:PAYSTACK_SECRET_KEY
if ([string]::IsNullOrWhiteSpace($secret)) {
  throw 'Set PAYSTACK_SECRET_KEY in the environment before running this local webhook check.'
}

$endpoint = if ([string]::IsNullOrWhiteSpace($env:SKILLBRIDGE_WEBHOOK_URL)) {
  'http://localhost:3000/api/paystack-webhook'
} else {
  $env:SKILLBRIDGE_WEBHOOK_URL
}

$payload = '{"event":"charge.success","data":{"id":987654321,"domain":"test","status":"success","reference":"skillbridge-test-reference","amount":100,"gateway_response":"Successful","customer":{"email":"test@example.com"}}}'
$hmac = [System.Security.Cryptography.HMACSHA512]::new(
  [System.Text.Encoding]::UTF8.GetBytes($secret)
)

try {
  $signature = [BitConverter]::ToString(
    $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($payload))
  ).Replace('-', '').ToLowerInvariant()

  Invoke-RestMethod `
    -Uri $endpoint `
    -Method Post `
    -Body $payload `
    -ContentType 'application/json' `
    -Headers @{ 'x-paystack-signature' = $signature }
} finally {
  $hmac.Dispose()
}
