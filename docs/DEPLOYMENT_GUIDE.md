# SKILLBRIDGE Deployment Configuration Guide

This guide explains how deployments are configured for all SKILLBRIDGE platforms.

## Overview

SKILLBRIDGE uses GitHub Actions to automate deployments across three platforms:

| Platform | Visibility | Trigger | Target | Status |
|----------|-----------|---------|--------|--------|
| **Web** | Public | Push to `main` | Vercel (Production) | ✅ Live |
| **Mobile** | Private | Push to `main` | EAS (Internal Distribution) | 📱 Internal |
| **Desktop** | Mixed | Push to `develop` (dev), Tags (prod) | GitHub Releases | 💻 Dev/Prod |

---

## 1. Web App - Public Production Deployment

**File**: `.github/workflows/deploy-web-production.yml`

### How It Works
- Triggers on every push to `main` branch
- Runs tests, linting, and builds
- Deploys to Vercel automatically
- Comments on the commit with deployment status

### Prerequisites
Set these secrets in GitHub (Settings → Secrets and Variables → Actions):

```
VERCEL_TOKEN        # From https://vercel.com/account/tokens
VERCEL_ORG_ID       # Organization ID from Vercel dashboard
VERCEL_PROJECT_ID   # Project ID for SkillBridge app
```

### Environment Variables
Set in Vercel dashboard (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Monitoring
- **Live URL**: https://skillbridge.vercel.app
- **Dashboard**: https://vercel.com/dashboard
- **Logs**: GitHub Actions tab → `Deploy Web - Production (Public)`

### Deployment Workflow
```
Push to main
    ↓
Run tests & linting
    ↓
Build web app
    ↓
Deploy to Vercel
    ↓
Comment on commit with live URL
```

---

## 2. Mobile App - Private Distribution

**File**: `.github/workflows/deploy-mobile-private.yml`

### How It Works
- Triggers on every push to `main` branch
- Can also be triggered manually or on schedule (daily)
- Builds iOS and Android for internal testing
- Uploads to EAS (private by default)

### Prerequisites
Set these secrets in GitHub:

```
EXPO_TOKEN          # From https://expo.dev account
```

### Environment Setup
Ensure `eas.json` is configured in `apps/mobile/`:

```json
{
  "build": {
    "preview": {
      "ios": {
        "buildType": "simulator"
      },
      "android": {
        "buildType": "preview"
      }
    }
  }
}
```

### Access Control
- **iOS**: Available via TestFlight (internal only)
- **Android**: Available via internal distribution link (private)
- **Expiration**: Builds auto-delete after 7 days

### Monitoring
- **Dashboard**: https://expo.dev (login required)
- **Logs**: GitHub Actions tab → `Deploy Mobile - Private Distribution`

### Deployment Workflow
```
Push to main
    ↓
Build iOS (EAS)
    ↓
Build Android (EAS)
    ↓
Notify team with download links
    ↓
Auto-delete in 7 days
```

### Manual Build
```bash
cd apps/mobile
eas login
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

---

## 3. Desktop App - Development & Production

### A. Development Builds

**File**: `.github/workflows/deploy-desktop-dev.yml`

#### How It Works
- Triggers on pushes to `develop` branch
- Builds for Windows, macOS, and Linux simultaneously
- Stores builds as artifacts (14-day retention)
- Creates cross-platform binaries

#### Available Downloads
- **Windows**: `.exe` installer + portable `.exe`
- **macOS**: `.dmg` disk image + `.zip`
- **Linux**: `.AppImage` + `.deb` package

#### Monitoring
- **Logs**: GitHub Actions tab → `Deploy Desktop - Development Build`
- **Artifacts**: Available in workflow run (Actions → latest run → Artifacts)

#### Development Workflow
```
Push to develop
    ↓
Build for Linux
Build for macOS
Build for Windows (parallel)
    ↓
Upload to artifacts
    ↓
Notify with download links
    ↓
Auto-delete in 14 days
```

### B. Production Release

**File**: `.github/workflows/deploy-desktop-production.yml`

#### How It Works
- Triggers on tags matching `v*.*.*` (e.g., `v1.0.0`)
- Builds production-ready binaries for all platforms
- Creates GitHub Release with auto-generated notes
- Enables code signing and notarization (when credentials available)

#### Creating a Production Release
```bash
# Tag the release
git tag v1.0.0

# Push tag to GitHub
git push origin v1.0.0

# GitHub Actions automatically:
# 1. Builds all platforms
# 2. Creates GitHub Release
# 3. Uploads binaries
```

#### Prerequisites for Signing
Set these secrets for production signing (optional but recommended):

```
# macOS Code Signing
APPLE_ID              # Your Apple ID email
APPLE_ID_PASSWORD     # App-specific password
APPLE_CERTIFICATE_P12 # Base64-encoded certificate

# Windows Code Signing (optional)
WINDOWS_CERTIFICATE   # Code signing certificate
```

#### GitHub Release Contents
- Platform-specific installers and portable versions
- Auto-generated release notes
- Download links for end-users

#### Production Workflow
```
Create git tag v1.0.0
    ↓
Push tag to main
    ↓
Build for Linux
Build for macOS
Build for Windows (parallel)
    ↓
Sign binaries (if credentials available)
    ↓
Create GitHub Release
    ↓
Upload all binaries
    ↓
Notify with release URL
```

#### User Download Flow
1. Visit: https://github.com/icessesbiney-glitch/SKILLBRIDGE/releases
2. Click latest release
3. Download for their platform
4. Extract and run

---

## Repository Access Levels

### Public Access
- **Web App**: ✅ Publicly accessible via Vercel
- **Documentation**: ✅ Public (GitHub Releases, deployment guides)
- **Source Code**: Depends on GitHub repo visibility

### Private Access
- **Mobile App**: 🔒 Internal distribution only (EAS private builds)
- **Signed Builds**: 🔒 GitHub Releases (auto-update enabled)
- **Secrets**: 🔒 Never committed (stored as GitHub Secrets)

---

## Environment Management

### Development Environment
- **Branch**: `develop`
- **Deployment**: Desktop development builds only
- **Retention**: 14 days
- **Access**: Team members via GitHub

### Production Environment
- **Branch**: `main` (web & mobile)
- **Tags**: `v*.*.*` (desktop releases)
- **Deployment**: Live + public releases
- **Retention**: Permanent (GitHub Releases)

---

## Secrets Management

All deployment secrets are stored as GitHub repository secrets. To configure:

1. Go to: **Settings → Secrets and Variables → Actions**
2. Click "New repository secret"
3. Add each secret from the respective section above

### Secret Checklist
- [ ] `VERCEL_TOKEN` - Web deployment
- [ ] `VERCEL_ORG_ID` - Web deployment
- [ ] `VERCEL_PROJECT_ID` - Web deployment
- [ ] `EXPO_TOKEN` - Mobile deployment
- [ ] `APPLE_ID` - macOS signing (optional)
- [ ] `APPLE_ID_PASSWORD` - macOS signing (optional)

### Security Best Practices
- Rotate tokens quarterly
- Use app-specific passwords (not account passwords)
- Never commit `.env` files
- Review GitHub audit logs regularly

---

## Troubleshooting

### Web Deployment Issues
```bash
# Test build locally
npm run build:web

# Check Vercel status
vercel status

# View deployment logs
vercel logs --prod
```

### Mobile Build Issues
```bash
# Clear EAS cache
eas build:clean

# View build logs
eas build:logs

# Test build locally
cd apps/mobile
npm run build:ios  # macOS only
npm run build:android
```

### Desktop Build Issues
```bash
# Clear build cache
rm -rf apps/desktop/dist apps/desktop/build

# Test build locally
npm run build:desktop
npm run dist:desktop:linux
npm run dist:desktop:mac  # macOS only
npm run dist:desktop:win  # Windows only
```

---

## Quick Reference

| Task | Command | Branch | Env |
|------|---------|--------|-----|
| Local web dev | `npm run dev` | develop | dev |
| Deploy web to prod | Push to `main` | main | prod |
| Test mobile locally | `npm run dev:web` or simulator | develop | dev |
| Build mobile private | Manual trigger or auto | main | private |
| Build desktop dev | Push to `develop` | develop | dev |
| Release desktop | `git tag v1.0.0 && git push origin v1.0.0` | main | prod |

---

## Next Steps

1. **Add secrets** to GitHub (see above)
2. **Test web deployment** by pushing to `main`
3. **Configure mobile signing** (iOS certificates, Android keystore)
4. **Set up code signing** for macOS (optional but recommended)
5. **Create first release** by tagging: `git tag v1.0.0`

For platform-specific guides, see:
- [Web Deployment](./DEPLOY_WEB.md)
- [Mobile Deployment](./DEPLOY_MOBILE.md)
- [Desktop Deployment](./DEPLOY_DESKTOP.md)
- [PWA Deployment](./DEPLOY_PWA.md)
