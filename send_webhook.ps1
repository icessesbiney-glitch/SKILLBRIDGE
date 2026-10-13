try {
    $url = "http://localhost:5020/api/webhooks/paystack"
    
    $headers = @{
        "x-paystack-signature" = "mock_production_hash_sig"
        "Content-Type"         = "application/json"
    }
    
    $payload = @{
        event = "charge.success"
        data = @{
            id = 9988
            status = "success"
            reference = "skillbridge_ref_0011"
            amount = 50000
            customer = @{ email = "test@skillbridge.app" }
        }
    } | ConvertTo-Json
    
    Write-Host "𝓓 Dispatching webhook payload to port 5020..." -ForegroundColor Yellow
    
    $res = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $payload
    
    Write-Host "`\n✅ Webhook delivered! Server Response:" -ForegroundColor Green
    $res | ConvertTo-Json
} catch {
    Write-Host "`\n❌ Connection dropped! Verify your server terminal window is listening on port 5020." -ForegroundColor Red
    Write-Host "Details: $_" -ForegroundColor Yellow
}