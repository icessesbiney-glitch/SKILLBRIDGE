# Mobile App Deployment Guide

## Platforms Supported

- ✅ iOS (iPhone, iPad)
- ✅ Android (Phone, Tablet)
- ✅ Web (React Native Web)

## Prerequisites

### iOS
- Apple Developer Account ($99/year)
- Xcode installed on macOS (App Store or Command Line Tools)
- Mac with Apple Silicon or Intel processor

### Android
- Google Play Developer Account ($25 one-time)
- Android SDK (via Android Studio)
- Java Development Kit (JDK 11+)
- Keystore for app signing

### Both
- EAS CLI installed: `npm install -g eas-cli`
- Expo account: Free signup at https://expo.dev

## Project Setup

### 1. Configure Expo

```bash
cd apps/mobile

# Initialize Expo (interactive setup)
eas build:configure

# Login to Expo
eas login
```

### 2. Generate Credentials

```bash
# iOS: Generate certificates (interactive)
eas credentials -p ios

# Android: Generate keystore (interactive)
eas credentials -p android
```

#### Keystore Backup (Important!)
Save your keystore securely:
```bash
eas credentials show
# Downloads keystore.jks to ~/.eas/credentials/android/
# BACKUP THIS FILE - losing it makes app updates impossible
```

## Build Process

### iOS Build

```bash
# Build for iOS
npm run build:ios

# This creates an .ipa file that can be:
# 1. Tested on device via TestFlight
# 2. Submitted to App Store
```

**Output**: Builds are stored in EAS and can be:
- Downloaded directly
- Submitted to TestFlight (Apple's beta testing)
- Submitted to App Store

### Android Build

```bash
# Build for Android
npm run build:android

# This creates an .aab (Android App Bundle) file
# Optimized for Google Play Store submission
```

**Output**: APK also available for direct installation

## Store Submission

### iOS App Store

#### Requirements Checklist
- [ ] App name (max 30 chars): "SkillBridge"
- [ ] Subtitle (max 30 chars): "Task Management"
- [ ] Bundle ID: "com.skillbridge.app"
- [ ] Version number: "1.0.0"
- [ ] Build number: "1"

#### Screenshots Required
- iPhone (5.81-inch): 2 minimum, 10 maximum
- iPad (12.9-inch): 2 minimum, 10 maximum
- iPhone 6.7-inch: 2 minimum, 10 maximum

Recommended: 3-5 screenshots per device type
Format: PNG or JPEG, 1200×1600px or 1600×1200px

#### App Icon
- Dimensions: 1024×1024px
- Format: PNG with alpha channel
- No rounded corners (iOS adds them)

#### App Information
- **Category**: Productivity
- **Subcategory**: Task Management
- **Descriptive Keywords**: tasks, goals, productivity, management
- **Privacy Policy URL**: https://yoursite.com/privacy
- **Support URL**: https://yoursite.com/support

#### Content Rating
Complete questionnaire in App Store Connect:
- Violence: None
- Alcohol/Tobacco: No
- Gambling: No
- Adult Content: No
- Etc.

#### Submission Steps
```bash
# 1. Build
npm run build:ios

# 2. Submit to App Store Connect
npm run submit:ios

# 3. Wait for Apple review (24-48 hours)
# 4. App approved, released, or rejected
# 5. Update based on feedback if needed
```

**TestFlight Beta Testing** (Before Release)
```bash
# Submit to TestFlight
npm run submit:ios --test-flight

# Invite beta testers
# Test for 1-2 weeks
# Fix issues
# Submit to App Store
```

### Google Play Store

#### Requirements Checklist
- [ ] App name: "SkillBridge"
- [ ] Short description (50 chars max)
- [ ] Full description (4000 chars max)
- [ ] Package name: "com.skillbridge.app"
- [ ] Version number: "1.0.0"
- [ ] Version code: "1"

#### Screenshots Required
- Phone (portrait): 2-8 screenshots
- Tablet (landscape): 0-8 screenshots
- 7-inch tablet: 0-8 screenshots
- 10-inch tablet: 0-8 screenshots

Recommended: 4-5 high-quality screenshots
Format: PNG or JPEG, 1080×1920px minimum

#### App Icon
- Dimensions: 512×512px
- Format: PNG or JPEG
- Transparent background preferred

#### Feature Graphic
- Dimensions: 1024×500px
- Required for visibility in Play Store

#### App Information
- **Category**: Productivity
- **Content Rating**: Complete questionnaire
- **Permissions**: Review and approve
- **Target Audience**: Everyone / Mature / Families

#### Privacy Policy
- **Privacy Policy URL**: https://yoursite.com/privacy (required)
- Must comply with Google Play policies
- Cannot collect personal data without consent

#### Submission Steps
```bash
# 1. Build
npm run build:android

# 2. Submit to Play Store
npm run submit:android

# 3. Wait for Google review (2-4 hours typically)
# 4. App approved or rejected
# 5. Released to production
```

**Open Testing** (Before Release)
```bash
# Make build available to limited testers
# In Google Play Console: Testing → Open Testing
# Testers install from Play Store link
# Collect feedback
# Move to production
```

## Store Policies & Compliance

### Common Rejection Reasons

**iOS**
- Incomplete app (unfinished features)
- Crashes or bugs on device
- Authentication not working
- Missing or inaccurate description
- Deceptive screenshots
- Terms of Service violations

**Android**
- Malware or security vulnerabilities
- Deceptive permissions
- Misleading descriptions
- Policy violations (gambling, adult content)
- Poor user reviews

### Avoid Rejection
1. Test thoroughly on real devices
2. Follow Apple & Google guidelines
3. Implement proper error handling
4. Make app features obvious
5. Use truthful descriptions/screenshots
6. Implement proper user consent
7. Handle permissions correctly

## Versioning & Updates

### Version Numbering
Format: `MAJOR.MINOR.PATCH` (1.0.0)

Update in `apps/mobile/app.json`:
```json
{
  "version": "1.0.0",
  "ios": { "buildNumber": "1" },
  "android": { "versionCode": 1 }
}
```

**Rules**:
- `buildNumber` (iOS) always increments (1, 2, 3...)
- `versionCode` (Android) always increments (1, 2, 3...)
- User-facing version can repeat (1.0.0)

### Submitting Updates

```bash
# Update version
# Edit apps/mobile/app.json

# Build & submit
npm run build:ios && npm run submit:ios
npm run build:android && npm run submit:android

# Both stores accept updates instantly
# No new review needed for bug fixes (usually)
```

## Monitoring & Analytics

### Recommended Tools

1. **Firebase Analytics** (Free)
   ```bash
   npm install firebase
   # Already integrated for tracking events
   ```

2. **Sentry** (Error tracking)
   ```bash
   npm install @sentry/react-native
   # Auto-catches crashes
   ```

3. **App Store Connect** (Apple metrics)
   - Downloads, Revenue, Crashes
   - User reviews and ratings

4. **Google Play Console** (Android metrics)
   - Installs, Uninstalls, Revenue
   - Crash reports, ANRs (Not Responding)

## Post-Release Checklist

- [ ] Monitor app store analytics
- [ ] Respond to user reviews
- [ ] Track crash reports
- [ ] Fix critical bugs within 24 hours
- [ ] Release patch (1.0.1) if needed
- [ ] Plan next feature release (1.1.0)

## Troubleshooting

### Build Fails
```bash
# Clear cache
cd apps/mobile
expo prebuild --clean

# Rebuild
npm run build:ios
npm run build:android
```

### Authentication Not Working on Device
- Check environment variables in `app.json`
- Ensure Supabase URL and key are correct
- Test on simulator first

### App Store Connect Errors
```bash
# Update Apple ID credentials
eas credentials show
# Follow prompts to re-enter credentials
```

### Google Play Rejected for Security
- Check for hardcoded API keys
- Use environment variables instead
- Ensure HTTPS for all API calls

---

For more details, see `/README-MULTIPLATFORM.md` or visit:
- Apple: https://developer.apple.com/app-store/
- Google: https://developer.android.com/distribute

**Estimated Store Submission Timeline:**
- iOS: 24-48 hours
- Android: 2-4 hours
