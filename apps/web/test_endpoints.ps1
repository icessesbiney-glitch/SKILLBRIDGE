Write-Host "?? Locating workspace API routes..." -ForegroundColor Cyan

$routes = Get-ChildItem -Path "C:\Users\ICESSES\SKILLBRIDGE" -Recurse -Include route.ts, route.js -ErrorAction SilentlyContinue | 
          Where-Object { $_.FullName -like "*\app\api\*" -and $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*\.next\*" }

if ($routes) {
    foreach ($file in $routes) {
        Write-Host "Found API Endpoint File: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "?? Recycling dev server socket layout..." -ForegroundColor Cyan
Get-Job -Name "SkillbridgeRootDev" -ErrorAction SilentlyContinue | Remove-Job -Force
Start-Job -Name "SkillbridgeRootDev" -ScriptBlock { cd C:\Users\ICESSES\SKILLBRIDGE; npx turbo run dev --filter=@skillbridge/web }

Write-Host "Warming up development socket on port 3001..." -ForegroundColor Cyan
Start-Sleep -Seconds 12

# Mock Request Context 
$payload = @{
    event = "charge.success"
    data = @{
        amount = 7500
        customer = @{ email = "joshua@skillbridge.gh" }
        reference = "SKB-MASTER-007"
    }
} | ConvertTo-Json

$headers = @{ 
    "Content-Type" = "application/json"
    "x-paystack-signature" = "any_test_signature_string" 
}

Write-Host ""
Write-Host "?? Probing correct local routing matrix on Port 3001..." -ForegroundColor Cyan

# UPDATED: Now targeting the true active development port 3001
$TARGET_URLS = @(
    "http://localhost:3001/api/webhooks/paystack",
    "http://localhost:3001/api/paystack-webhook"
)

foreach ($TEST_URL in $TARGET_URLS) {
    try {
        Write-Host "Testing POST request to $TEST_URL..." -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri $TEST_URL -Method Post -Body $payload -Headers $headers -TimeoutSec 5
        Write-Host "? Path Success: Response received from $TEST_URL." -ForegroundColor Green
        $response | ConvertTo-Json | Write-Host
    } catch {
        Write-Host "? Matrix Response: [$TEST_URL] -> status: $($_.Exception.Message)" -ForegroundColor Red
    }
}
