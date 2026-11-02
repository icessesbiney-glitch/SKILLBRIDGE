# SkillBridge Repository Web Deployment Guide

## Core Project Mission & Architecture
SkillBridge is architected as an automated, global multi-vendor marketplace hub. To preserve security, strict data isolation, and transactional integrity, all deploying applications must align with this infrastructure. This guide ensures that our shared workspaces deploy only clean, isolated SkillBridge application modules.

## Automated Branch Strategy
* **`main` Branch:** Deploys automatically to **Vercel** for public production use.
* **`develop` Branch:** Deploys automatically to **Netlify** for private preview testing.

All code exports (including those from Bolt.new) must land in this repository first so that our customized workspace validation pipelines can execute checks before passing bundles to production.

---

## Hosting Options

### 1. Production Hosting: Vercel (Public Deploy)
Vercel handles our live public user layers, processing speed diagnostics, and automated secure connection seals.

#### Monorepo Dashboard Settings
* **Root Directory:** Set explicitly to `apps/web` inside the Vercel project panel to avoid scanning unrelated workspace components.
* **Production Build Command:** Executed automatically via `npx turbo run build --filter=@skillbridge/web`.

```bash
# Verify the build mechanics locally before pushing changes
npx turbo run build --filter=@skillbridge/web
```

### 2. Alternative Hosting: Netlify (Private Previews)
Netlify acts as our secure sandbox environment for the `develop` branch.

#### Automated Configuration
* Base directory must point directly to the repository root.
* Ensure `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` are configured in your GitHub Repository Secrets to allow `deploy-web-private.yml` to trigger preview builds automatically.

---

## Workspace Environment Variables
The following credential arrays are strictly required to be mapped inside your hosting dashboards. **Do not commit these variables directly to your open source codebase.**

### Required Infrastructure Tokens
```text
# Supabase Core Access Layers
NEXT_PUBLIC_SUPABASE_URL=https://supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-secure-public-anon-key-string

# Financial Gateway Connection Ledger
DODO_WEBHOOK_SECRET=your-dodo-payments-live-signature-key
```

---

## Pre-Deployment Verification Checklist
Before saving or merging any changes into your active workflow branches, execute these verification layers sequentially from your terminal to guarantee a 100% build pass metric:

1. **Dependency Alignment:** Mismatched packages must bypass peer lock blocks:
   ```bash
   npm ci --legacy-peer-deps
   ```
2. **Workspace Linter Check:**
   ```bash
   npm run lint --workspace=@skillbridge/web
   ```
3. **Workspace Type Security:**
   ```bash
   npm run type-check --workspace=@skillbridge/web
   ```
4. **Workspace Compilation Pass:**
   ```bash
   npx turbo run build --filter=@skillbridge/web
   ```

---

## Deployment Steps (Vercel Production)

### 1. Commit Your Code Changes
```bash
git add .
git commit -m "chore: optimize skillbridge deployment pipelines"
git push origin main
```
*(GitHub Actions will instantly intercept this commit and trigger `deploy-web-production.yml` to push the build to production)*.

### 2. Verify Your Live Deployment
Open your production URL panel (`https://skillbridge-nine-mu.vercel.app`) and confirm that the navigation chrome layer fetches the live ledger wallet values accurately.

---

## Performance, Analytics & Telemetry

### Monitored Performance Goals
Our custom platform utilizes image optimization, code splitting, and strict workspace filters to guarantee elite web performance across modern mobile, desktop, and feature phone browsers.
* **Performance:** 90+
* **Accessibility:** 95+
* **Best Practices:** 95+
* **SEO:** 95+

### Real-Time Error Auditing
Track active transactional paths, database handshakes, and event codes directly through your **Vercel Project Logs** and your **Supabase Query Terminal** to ensure incoming real-money webhooks match your profile columns flawlessly.
