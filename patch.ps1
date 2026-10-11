Remove-Item -Recurse -Force .turbo, apps\web\.next, node_modules\.cache -ErrorAction SilentlyContinue
[System.Environment]::SetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL", "https://supabase.co", "Process")
[System.Environment]::SetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo", "Process")
[System.Environment]::SetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY", "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo", "Process")
npx turbo run build --filter=@skillbridge/web --cache=local:r
vercel project update skillbridge --root-directory null --yes
vercel project update skillbridge --build-command "npx turbo run build --filter=@skillbridge/web" --yes
vercel deploy --prod --force --yes
