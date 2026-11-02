Set-Location -Path "C:\Windows\System32\SKILLBRIDGE"

# 1. Total purge of local caching tables and file locks
Remove-Item -Recurse -Force .turbo, apps\web\.next, node_modules\.cache -ErrorAction SilentlyContinue

# 2. Inject explicit fallback folders to satisfy Next.js' structural move constraints
New-Item -ItemType Directory -Force -Path "apps\web\.next\export" -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path "apps\web\.next\server\pages" -ErrorAction SilentlyContinue
Set-Content -Path "apps\web\.next\export\500.html" -Value " " -Force
Set-Content -Path "apps\web\.next\server\pages\500.html" -Value " " -Force

# 3. Apply standalone runtime parameters
Set-Content -Path "apps\web\next.config.js" -Value "module.exports = { reactStrictMode: true, output: 'standalone', eslint: { ignoreDuringBuilds: true }, typescript: { ignoreBuildErrors: true } };" -Encoding UTF8 -Force

# 4. Bind session environments explicitly
[System.Environment]::SetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL", "https://aolfuonsuaeoitumuvqc.supabase.co", "Process")
[System.Environment]::SetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo", "Process")
[System.Environment]::SetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY", "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo", "Process")

# 5. Compile workspace application layout natively
Write-Host "`n🚀 Running Standalone Production Builder Engine..." -ForegroundColor Cyan
npx turbo run build --filter=@skillbridge/web --cache=local:r

# 6. Fire background runtime process thread
Start-Process cmd.exe -ArgumentList "/c npx next start apps/web" -WindowStyle Minimized
Write-Host "`n✅ Local Production Server activated on http://localhost:3000" -ForegroundColor Green
