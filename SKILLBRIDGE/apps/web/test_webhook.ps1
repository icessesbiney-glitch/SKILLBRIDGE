Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
\$envContent = @(
  'NEXT_PUBLIC_SUPABASE_URL=https://aolfuonsuaeoitumuvqc.supabase.co',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo',
  'PAYSTACK_SECRET_KEY=sk_test_your_real_paystack_secret_key'
)
Set-Content -Path ".env.local" -Value \(envContent -Encoding Ascii -Force\)serverProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -Command `"`$env:NEXT_PUBLIC_SUPABASE_URL='https://aolfuonsuaeoitumuvqc.supabase.co'; `\$env:NEXT_PUBLIC_SUPABASE_ANON_KEY='sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo'; `\$env:PAYSTACK_SECRET_KEY='sk_test_your_real_paystack_secret_key'; npx next dev -p 3000`"" -PassThru -NoNewWindow
Start-Sleep -Seconds 12
\$payload = '{"event": "charge.success", "data": {"id": 987654321, "domain": "test", "status": "success", "reference": "WITHDRAW_TXN_1791582640", "amount": 2500, "gateway_response": "Successful", "customer": {"email": "joshua@skillbridge-dev.internal"}}}'
\$secret = "sk_test_your_real_paystack_secret_key"
\$hmac = New-Object System.Security.Cryptography.HMACSHA512
\$hmac.Key = [System.Text.Encoding]::UTF8.GetBytes(\(secret)\)bodyBytes = [System.Text.Encoding]::UTF8.GetBytes(\(payload)\)hashBytes = hmac.ComputeHash(bodyBytes)
\(signature = [System.BitConverter]::ToString(\)hashBytes).Replace("-", "").ToLower()
\(headers = @{ "x-paystack-signature" = \)signature }
try {
    \$response = Invoke-RestMethod -Uri "http://localhost:3000/api/paystack-webhook" -Method Post -Body payload -ContentType "application/json" -Headers headers
    Write-Host "? SUCCESS: Server Responded Natively!" -ForegroundColor Green
    \$response
} catch {
    Write-Host "? Handshake failed." -ForegroundColor Red
    if (\(_.Exception.Response) {\)reader = New-Object System.IO.StreamReader(\(_.Exception.Response.GetResponseStream())\)reader.ReadToEnd()
    } else { \$_.Exception.Message }
}
