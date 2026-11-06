# Desktop App Deployment Guide

## Platform Support

- ✅ Windows (x64, arm64)
- ✅ macOS (Intel, Apple Silicon)
- ✅ Linux (AppImage, .deb)

## Prerequisites

### All Platforms
- Node.js 16+
- npm or yarn
- Git

### macOS Only
- Xcode Command Line Tools
- Apple Developer Account (for signing/notarization)

### Windows
- (Optional) Visual Studio Build Tools for code signing

## Build & Package

### Windows

```bash
# Build
npm run dist:desktop:win

# Output
dist/SkillBridge-x.x.x.exe           # NSIS Installer
dist/SkillBridge-x.x.x-portable.exe  # Portable (no install needed)
```

**Installation**: End-users run the .exe installer

**Auto-Update**: Integrated via Electron Squirrel for Windows

### macOS

```bash
# Must run on macOS!
npm run dist:desktop:mac

# Output
dist/SkillBridge-x.x.x.dmg           # Disk Image
dist/SkillBridge-x.x.x.zip           # Direct app file
```

**Installation**: Drag SkillBridge.app to Applications folder

**Code Signing** (Production):
```bash
# Get certificate from Apple Developer Portal
# Update apps/desktop/package.json:
# "certificateFile": "/path/to/certificate.p12"

# For notarization (required on macOS 10.15+):
export APPLE_ID="your-email@example.com"
export APPLE_ID_PASSWORD="app-specific-password"
npm run dist:desktop:mac
```

### Linux

```bash
# Build
npm run dist:desktop:linux

# Output
dist/SkillBridge-x.x.x.AppImage      # Single executable
dist/skillbridge-x.x.x.deb          # Debian/Ubuntu package
dist/skillbridge-x.x.x.tar.gz       # Source archive
```

**Installation**:
- AppImage: Make executable, double-click
- .deb: `sudo apt install ./skillbridge-x.x.x.deb`

## Distribution Methods

### Method 1: Direct Download (Recommended for Launch)

1. **Create Release on GitHub**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   # Upload binaries to GitHub Releases page
   ```

2. **Website Download Page**
   ```html
   <a href="https://github.com/yourname/skillbridge/releases">
     Download SkillBridge
   </a>
   ```

### Method 2: Auto-Update (After Launch)

Already integrated! Users get notifications for updates.

```bash
# Update builds automatically on new release
npm run dist:desktop:win && git tag v1.0.1 && git push
```

### Method 3: Store Distribution

**Windows Store**:
- Submit via Microsoft Partner Center
- Review: 1-2 weeks

**Mac App Store**:
- Submit via App Store Connect
- Requires code signing + notarization
- Review: 1-2 weeks

## Post-Build Checklist

- [ ] Test installation on clean Windows machine
- [ ] Test installation on clean macOS machine
- [ ] Test installation on Linux (Ubuntu)
- [ ] Verify auto-update works
- [ ] Test offline functionality
- [ ] Verify Supabase connection
- [ ] Check file associations (on Windows)
- [ ] Test uninstall/reinstall

## Troubleshooting

### App won't start
```bash
# Check logs
# Windows: %APPDATA%/SkillBridge/logs
# macOS: ~/Library/Logs/SkillBridge
# Linux: ~/.config/SkillBridge/logs
```

### Update fails
```bash
# Clear cache
rm -rf ~/.SkillBridge  # Linux/macOS
rmdir %APPDATA%\SkillBridge  # Windows

# Reinstall
```

### Code signing errors (macOS)
```bash
# List available certificates
security find-identity -v -p codesigning

# Update apps/desktop/package.json with correct certificate name
```

## Security Checklist

- [ ] Enable code signing (macOS/Windows)
- [ ] Enable notarization (macOS)
- [ ] Use HTTPS for auto-update checks
- [ ] Never commit secrets to git
- [ ] Sign all release binaries
- [ ] Post SHA256 hashes with releases

## Version & Release Management

Update version in:
1. `apps/desktop/package.json` - version field
2. Git tag: `git tag v1.0.0`
3. GitHub Release notes

Auto-update triggers on:
- New git tag matching semver (v1.0.0)
- New release on GitHub

## Analytics & Monitoring

Track desktop installs:
```typescript
// In apps/desktop/src/main.ts
if (isDev === false) {
  // Send telemetry on first launch
  // Example: ga('send', 'event', 'app', 'launch')
}
```

---

For issues, check `/README-MULTIPLATFORM.md` or GitHub Issues.
