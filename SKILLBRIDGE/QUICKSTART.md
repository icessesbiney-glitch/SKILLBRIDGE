# 🚀 SkillBridge Multi-Platform Quick Start

Welcome! Your SkillBridge app is now ready to run on **Web, Desktop, Mobile (iOS/Android), and as a Progressive Web App**.

## 📋 What's Included

- ✅ **Web**: Next.js 14 (existing)
- ✅ **Desktop**: Electron app (Windows, macOS, Linux)
- ✅ **Mobile**: React Native (iOS, Android via Expo)
- ✅ **PWA**: Progressive Web App (install from browser)
- ✅ **Shared**: Common code, types, Supabase client
- ✅ **Monorepo**: All platforms managed together

## ⚡ Quick Start (5 minutes)

### 1. Install All Dependencies
```bash
npm install
```

### 2. Set Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Web (Easiest)
```bash
npm run dev
# Opens http://localhost:3000
```

## 🎯 Choose Your Platform

### Web App
```bash
npm run dev
# Deploy to Vercel: npm install -g vercel && vercel deploy --prod
```

### Desktop App
```bash
# Requires web running on :3000 first
npm run dev:all
# Or individual: cd apps/desktop && npm run dev
# Package: npm run dist:desktop:win (Windows)
# Package: npm run dist:desktop:mac (macOS)
# Package: npm run dist:desktop:linux (Linux)
```

### Mobile App
```bash
cd apps/mobile

# iOS on macOS
npm run dev:ios

# Android
npm run dev:android

# Web preview
npm run dev:web
```

### Progressive Web App (PWA)
1. Open http://localhost:3000 in Chrome
2. Click install icon (address bar)
3. App on home screen/desktop
4. Works offline!

## 📦 Build All Platforms

```bash
# Build everything
npm run build:all

# Package individual platforms
npm run dist:desktop         # All desktop OS
npm run dist:desktop:win     # Windows only
npm run build:mobile:ios     # iOS
npm run build:mobile:android # Android
```

## 📚 Full Documentation

- **Complete Guide**: See [README-MULTIPLATFORM.md](README-MULTIPLATFORM.md)
- **Desktop Deployment**: See [docs/DEPLOY_DESKTOP.md](docs/DEPLOY_DESKTOP.md)
- **Mobile Deployment**: See [docs/DEPLOY_MOBILE.md](docs/DEPLOY_MOBILE.md)
- **Web Deployment**: See [docs/DEPLOY_WEB.md](docs/DEPLOY_WEB.md)
- **PWA Setup**: See [docs/DEPLOY_PWA.md](docs/DEPLOY_PWA.md)

## 🚀 Release Timeline

### Week 1: Launch Web + PWA
```bash
npm run build:web
# Deploy to Vercel
# Users can install as PWA on mobile
```

### Week 2-3: Desktop Apps
```bash
npm run dist:desktop:win
npm run dist:desktop:mac
npm run dist:desktop:linux
# Upload to website
```

### Week 4: App Stores
```bash
npm run build:mobile:ios
npm run build:mobile:android
# Submit to Apple App Store & Google Play
```

## ✅ Pre-Deployment Checklist

- [ ] `npm run type-check` passes (no TypeScript errors)
- [ ] `npm run lint` passes (no lint warnings)
- [ ] `npm test` passes (or shows "No tests")
- [ ] `npm run build:web` succeeds
- [ ] Environment variables set correctly
- [ ] Supabase connection working
- [ ] Tested on target devices

## 🔑 Environment Variables Required

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# For mobile builds (optional)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📱 Download Your App

### After Deployment

**Web**: https://skillbridge.vercel.app (or your domain)

**Desktop**:
- Windows: Download `.exe` from website
- macOS: Download `.dmg` from website
- Linux: Download `.AppImage` or `.deb` from website

**Mobile**:
- iOS: Apple App Store (search "SkillBridge")
- Android: Google Play Store (search "SkillBridge")

**PWA**: 
- Any browser: Click install button
- Works offline and installs to home screen

## 🆘 Troubleshooting

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build:all
```

### Mobile build fails
```bash
cd apps/mobile
expo prebuild --clean
npm run dev:ios
```

### Desktop won't start
```bash
cd apps/desktop
rm -rf dist node_modules
npm install
npm run dev
```

## 📞 Support & Resources

- **GitHub Issues**: https://github.com/icessesbiney-glitch/SKILLBRIDGE/issues
- **Vercel Docs**: https://vercel.com/docs
- **Expo Docs**: https://docs.expo.dev
- **Electron Docs**: https://www.electronjs.org/docs
- **Next.js Docs**: https://nextjs.org/docs

## 🎉 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Set environment variables: Edit `.env.local`
3. ✅ Run web app: `npm run dev`
4. ✅ Test locally on target devices
5. ✅ Deploy web: `npm run build:web` → Vercel
6. ✅ Package desktop: `npm run dist:desktop:win`
7. ✅ Build mobile: `npm run build:mobile:ios`
8. ✅ Submit to app stores (see deployment guides)

**Ready? Start with:** `npm install && npm run dev`

---

**SkillBridge - Build Momentum Together** 🚀
