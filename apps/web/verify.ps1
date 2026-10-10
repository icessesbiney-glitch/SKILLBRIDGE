$p = '{"event":"charge.success","data":{"id":987654321,"domain":"test","status":"success","reference":"WITHDRAW_TXN_1791582640","amount":2500,"gateway_response":"Successful","customer":{"email":"joshua@skillbridge-dev.internal"}}}'
$k = "sk_test_your_real_paystack_secret_key"
$h = New-Object System.Security.Cryptography.HMACSHA512
$h.Key = [System.Text.Encoding]::UTF8.GetBytes($k)
$sh = $h.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($p))
$sig = [System.BitConverter]::ToString($sh).Replace("-","").ToLower()
$hd = @{"x-paystack-signature"=$sig}
try {
    $r = Invoke-RestMethod -Uri "http://127.0.0" -Method Post -Body $p -ContentType "application/json" -Headers $hd
    Write-Host "? SUCCESS: Handshake simulation completed natively!" -ForegroundColor Green
    $r | ConvertTo-Json
} catch {
    Write-Host "? Handshake failed." -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Server Response: $($stream.ReadToEnd())" -ForegroundColor Yellow
    } else {
        Write-Host "Error Details: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
