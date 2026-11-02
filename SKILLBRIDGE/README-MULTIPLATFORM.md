# SkillBridge - Multi-Platform Application

Complete guide to building, deploying, and distributing SkillBridge across all platforms.

## Project Structure

```
skillbridge/
├── apps/
│   ├── web/              # Next.js web application
│   ├── desktop/          # Electron desktop app
│   └── mobile/           # React Native mobile app
├── packages/
│   └── shared/           # Shared code, types, and utilities
├── .github/workflows/    # CI/CD automation
└── package.json          # Monorepo root
```

## Quick Start

### Installation
```bash
# Install all dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Development

**Web Only:**
```bash
npm run dev
```

**All Platforms:**
```bash
npm run dev:all
```

**Individual Platforms:**
```bash
# Web
cd apps/web && npm run dev

# Desktop (requires web running on :3000)
cd apps/desktop && npm run dev

# Mobile Web Preview
cd apps/mobile && npm run dev:web

# Mobile iOS
cd apps/mobile && npm run dev:ios

# Mobile Android
cd apps/mobile && npm run dev:android
```

---

## 🖥️ Desktop Distribution

### Windows & Linux

#### Build
```bash
npm run dist:desktop:win
npm run dist:desktop:linux
```

#### Distribution Options
1. **Direct Download**: Upload `.exe` / `.AppImage` to your website
2. **Microsoft Store**: Use Windows App Submission
3. **Standalone Installer**: NSIS installer included

#### Files Output
- Windows: `dist/SkillBridge-x.x.x.exe` (installer)
- Linux: `dist/SkillBridge-x.x.x.AppImage` (portable)

### macOS

#### Prerequisites
```bash
# Must run on macOS
npm run dist:desktop:mac
```

#### Distribution Options
1. **Direct DMG Download**: `dist/SkillBridge-x.x.x.dmg`
2. **Mac App Store**: Submit signed .app bundle
3. **Notarization**: Required for Gatekeeper on macOS

#### Code Signing (Optional but Recommended)
```bash
# Generate certificate or use existing
# In apps/desktop/package.json, update build.mac.certificateFile
npm run dist:desktop:mac
```

---

## 📱 Mobile Distribution

### iOS (Apple App Store)

#### Prerequisites
- Apple Developer Account ($99/year)
- Xcode installed on macOS
- Valid provisioning profiles & certificates

#### Build Process
```bash
# 1. Create EAS Build account
npm install -g eas-cli
eas login

# 2. Configure EAS (interactive)
cd apps/mobile
eas build:configure

# 3. Build for iOS
npm run build:ios

# 4. Submit to App Store
npm run submit:ios
```

#### Configuration Files
- `apps/mobile/app.json` - App Store metadata
- `apps/mobile/eas.json` - Build configuration

#### App Store Requirements
- App name, description, keywords
- Screenshots (6 per device type)
- App icon (1024×1024 PNG)
- Privacy policy URL
- Support email
- Category selection
- Version number

### Android (Google Play Store)

#### Prerequisites
- Google Play Developer Account ($25, one-time)
- Keystore file for signing
- Google Play Console access

#### Build Process
```bash
cd apps/mobile

# 1. Create keystore (first time only)
keytool -genkey -v -keystore ./android/keystores/release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias skillbridge

# 2. Build for Android
npm run build:android

# 3. Submit to Play Store
npm run submit:android
```

#### Configuration
- `apps/mobile/app.json` - Package name, version
- `apps/mobile/eas.json` - Build and submission settings

#### Play Store Requirements
- App title, description, category
- Screenshots (4+ per phone size)
- App icon (512×512 PNG)
- Feature graphic (1024×500 PNG)
- Privacy policy URL
- Support email
- Content rating questionnaire

### Progressive Web App (PWA)

#### Enable PWA (Web)
The web app is already PWA-capable. Users can:
- "Install" on home screen (iOS/Android)
- Use offline (with service worker)
- Get app-like experience

#### Steps to Enable
1. Web app accessible at HTTPS
2. Users open in mobile browser
3. Tap "Share" → "Add to Home Screen"
4. Launch like native app

---

## 🚀 Full Build & Deploy

### Build All Platforms
```bash
# Build shared code, web, desktop, and mobile
npm run build:all
```

### CI/CD Pipeline

The GitHub Actions workflow in `.github/workflows/ci.yml` automatically:
1. Runs linting and type checking
2. Builds web and desktop
3. Runs test suite
4. Reports results

#### Manual Deployment
```bash
# 1. Commit and push to main
git add .
git commit -m "Release v1.0.0"
git push origin main

# 2. GitHub Actions builds automatically
# 3. Download artifacts or deploy manually
```

---

## 📦 Distribution Checklist

### Before Release

- [ ] Update version in `apps/web/package.json`
- [ ] Update version in `apps/mobile/app.json`
- [ ] Update version in `apps/desktop/package.json`
- [ ] Update `README.md` with new features
- [ ] Run `npm run type-check` (all platforms)
- [ ] Run `npm run lint` (web)
- [ ] Test on actual devices:
  - [ ] Windows
  - [ ] macOS
  - [ ] Linux
  - [ ] iOS device
  - [ ] Android device

### Desktop Release

```bash
# Create GitHub release with binaries
npm run dist:desktop:win
npm run dist:desktop:linux
npm run dist:desktop:mac  # Only on macOS

# Upload binaries to GitHub Releases or website
```

### Mobile Release

#### iOS
```bash
npm run build:ios
# App Store Connect: Wait for review (~24-48 hours)
npm run submit:ios
```

#### Android
```bash
npm run build:android
# Google Play Console: Wait for review (~2-4 hours)
npm run submit:android
```

---

## 🔑 Environment Variables

### Required (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Expo/Mobile
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Optional (Desktop/Mobile Signing)
```env
# Apple signing (macOS only)
APPLE_ID=your-apple-id@example.com
APPLE_ID_PASSWORD=app-specific-password

# Google Play (Android)
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_PATH=path/to/service-account.json
```

---

## 🔄 Update & Maintenance

### Auto-Update (Desktop)

Electron has built-in update checking. Users receive notifications and can update immediately.

### Manual App Update

- **iOS**: Updates via App Store (automatic or manual per user)
- **Android**: Updates via Google Play (automatic or manual per user)
- **Web**: Always latest version (no install needed)

---

## 📊 Analytics & Monitoring

### Recommended Tools
- **Sentry**: Error tracking across all platforms
- **Firebase Analytics**: User behavior tracking
- **Amplitude**: Advanced analytics
- **Hotjar**: Session recording & heatmaps

### Implementation
```typescript
// Already integrated in shared package
// Add analytics calls to useAuth and useDatabase hooks
```

---

## 🐛 Troubleshooting

### Desktop Build Issues
```bash
# Clear Electron cache
rm -rf apps/desktop/dist
rm -rf apps/desktop/node_modules

# Rebuild
npm install
npm run dist:desktop:win
```

### Mobile Build Issues
```bash
# Clear Expo cache
cd apps/mobile
expo prebuild --clean

# Rebuild
npm run build:ios
npm run build:android
```

### Signing Errors
- Ensure certificates are valid (not expired)
- Check provisioning profiles for iOS
- Verify keystore password for Android

---

## 📚 Additional Resources

- **Electron**: https://www.electronjs.org/docs
- **React Native / Expo**: https://docs.expo.dev
- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **EAS (Mobile CI/CD)**: https://docs.expo.dev/eas

---

## Support

For issues or questions:
1. Check this README
2. Review GitHub Issues
3. Open a new GitHub Issue with platform details

---

**SkillBridge - Build Momentum Together** 🚀
