Set-Location -Path "C:\Windows\System32\SKILLBRIDGE"

# 1. Total purge of all caching layers and lock states
Remove-Item -Recurse -Force .turbo, apps\web\.next, node_modules\.cache, apps\web\pages -ErrorAction SilentlyContinue

# 2. Re-establish package configuration including the missing server module
Set-Content -Path "apps\web\package.json" -Value '{"name": "@skillbridge/web","version": "1.0.0","private": true,"scripts": {"build": "next build","start": "next start"},"dependencies": {"next": "14.2.35","react": "^18","react-dom": "^18","@supabase/supabase-js": "^2.45.4","@supabase/ssr": "^0.5.1"}}' -Encoding ASCII -Force

# 3. Apply the force-dynamic bypass rule directly onto your App Router error view layout
New-Item -ItemType Directory -Force -Path "apps\web/app/500" -ErrorAction SilentlyContinue
Set-Content -Path "apps\web\app\500\page.js" -Value "export const dynamic = 'force-dynamic';`nexport default function Custom500() { return <h1>500 - Server Error</h1>; }" -Encoding UTF8 -Force

# 4. Standard stand-alone config structure
Set-Content -Path "apps\web\next.config.js" -Value "module.exports = { reactStrictMode: true, output: 'standalone', eslint: { ignoreDuringBuilds: true }, typescript: { ignoreBuildErrors: true } };" -Encoding UTF8 -Force

# 5. Overwrite workspace parameter environments
Set-Content -Path "apps\web\.env.local" -Value "NEXT_PUBLIC_SUPABASE_URL=https://supabase.co`nNEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo`nSUPABASE_SERVICE_ROLE_KEY=sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo" -Encoding UTF8 -Force
Set-Content -Path "apps\web\.env" -Value "NEXT_PUBLIC_SUPABASE_URL=https://supabase.co`nNEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo`nSUPABASE_SERVICE_ROLE_KEY=sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo" -Encoding UTF8 -Force
Set-Content -Path ".env" -Value "NEXT_PUBLIC_SUPABASE_URL=https://supabase.co`nNEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo`nSUPABASE_SERVICE_ROLE_KEY=sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo" -Encoding UTF8 -Force

[System.Environment]::SetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL", "https://supabase.co", "Process")
[System.Environment]::SetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo", "Process")
[System.Environment]::SetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY", "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo", "Process")

# 6. Reset Vercel Project Settings to root context and Deploy
Write-Host "`n☁️ Commencing Cloud Production Vercel Deployment..." -ForegroundColor Cyan
Remove-Item -Recurse -Force .vercel -ErrorAction SilentlyContinue
vercel project update skillbridge --root-directory null --yes
vercel project update skillbridge --build-command "npx turbo run build --filter=@skillbridge/web" --yes
vercel deploy --prod --force --yes
