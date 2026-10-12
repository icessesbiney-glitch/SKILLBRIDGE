# SkillBridge Platform-Specific Guides

This folder contains platform-specific deployment and distribution guides.

## Contents

- `DEPLOY_DESKTOP.md` - Desktop (Windows, macOS, Linux) deployment
- `DEPLOY_MOBILE.md` - Mobile (iOS, Android) deployment  
- `DEPLOY_WEB.md` - Web deployment
- `DEPLOY_PWA.md` - Progressive Web App setup

## Quick Platform Comparison

| Platform | Distribution | Effort | Reach |
|----------|--------------|--------|-------|
| **Web** | https://skillbridge.app | ⭐ Easiest | Maximum |
| **PWA** | Install from browser | ⭐ Easy | iOS/Android/Desktop |
| **Desktop** | .exe/.dmg/.AppImage | ⭐⭐ Medium | Windows/Mac/Linux |
| **iOS** | Apple App Store | ⭐⭐⭐ Hard | iPhone/iPad users |
| **Android** | Google Play Store | ⭐⭐⭐ Hard | Android users |

## Recommended Release Strategy

1. **Week 1**: Deploy web version, enable PWA
2. **Week 2-3**: Build and distribute desktop apps
3. **Week 4+**: Submit to app stores (iOS & Android)

All platforms share the same backend, so deploy once, run everywhere!
