Clear-Host
Write-Host "🚀 Commencing Full Automated Pipeline Stack..." -ForegroundColor Magenta

# 1. Clear background processes and lock caches
Write-Host "`n🧹 Clearing background processes and cache pools..." -ForegroundColor Cyan
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next, apps/web/.next, .turbo -ErrorAction SilentlyContinue

# 2. Inject live environment variables directly into runtime memory
Write-Host "🔑 Binding live platform environment variables..." -ForegroundColor Cyan
$env:NEXT_PUBLIC_SUPABASE_URL="https://aolfuonsuaeoitumuvqc.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo"

# 3. Force populate local fallback files to prevent static route build drops
Set-Content -Path "apps/web/.env.local" -Value "NEXT_PUBLIC_SUPABASE_URL=https://aolfuonsuaeoitumuvqc.supabase.co`nNEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo" -Force

# 4. Validate workspace packages 
Write-Host "🏗️  Validating workspace package compilation..." -ForegroundColor Cyan
npx turbo run build --filter=@skillbridge/web

# 5. Handle process routing using native exit validation flags
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n⚡ Booting up development sandbox server on http://localhost:3001..." -ForegroundColor Green
    npx turbo run dev --filter=@skillbridge/web
} else {
    Write-Host "`n❌ Pipeline initialization halted due to local code build failure." -ForegroundColor Red
    Exit 1
}
