# Progressive Web App (PWA) Setup

## What is a PWA?

A Progressive Web App is a web application that works offline and can be installed on:
- iOS (via web clip)
- Android (via Add to Home Screen)
- Desktop (via browser install button)

## Current PWA Setup ✅

Your app already has PWA support:

- ✅ Web manifest: `/public/manifest.json`
- ✅ Service Worker: `/public/sw.js`
- ✅ Meta tags: `app/layout.tsx`
- ✅ Icons: `/public/icon-*.png`
- ✅ Offline support: Caching strategy

## Enable Installation

### On Android
1. Open app in Chrome browser
2. Tap 3-dot menu → "Install app"
3. App appears on home screen

### On iOS (Safari)
1. Open app in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. App appears on home screen

### On Desktop (Chrome/Edge)
1. Open app in Chrome or Edge
2. Click install icon (address bar)
3. Click "Install"
4. App opens in window

## PWA Features Enabled

### 1. Offline Support
- Service Worker caches pages
- Works without internet
- Syncs data when online

### 2. App-Like Experience
- Standalone window (no address bar)
- Splash screen on load
- Status bar theming

### 3. Quick Access
- Home screen icon
- App shortcuts
- Fast loading

## Required Assets

Add these to `/public/`:

```
/public/
├── icon-192.png       # 192×192 app icon
├── icon-512.png       # 512×512 app icon
├── apple-touch-icon.png  # 180×180 for iOS
├── favicon.ico        # Favicon
└── manifest.json      # Already exists
```

### Creating Icons

Option 1: Use icon generator
```bash
# Online: https://www.favicon-generator.org
# Upload 512px icon, download all sizes
```

Option 2: ImageMagick (command line)
```bash
convert icon-512.png -resize 192x192 icon-192.png
convert icon-512.png -resize 180x180 apple-touch-icon.png
```

## Manifest Configuration

Already configured in `/public/manifest.json`:

```json
{
  "name": "SkillBridge",
  "short_name": "SkillBridge",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#1a56db",
  "background_color": "#ffffff",
  "icons": [...]
}
```

**Customize:**
- `name`: Full app name
- `short_name`: Short name (≤12 chars) for home screen
- `theme_color`: Status bar color
- `background_color`: Splash screen color
- `start_url`: App entry point
- `display`: `standalone`, `fullscreen`, or `minimal-ui`

## Service Worker Caching

Already configured in `/public/sw.js`:

### Strategy: Network First
1. Try to fetch from network
2. If online, cache response
3. If offline, use cache
4. If offline + no cache, show offline message

### Add More Pages to Cache

Edit `/public/sw.js`:
```javascript
const urlsToCache = [
  '/',
  '/manifest.json',
  '/dashboard',        // Add
  '/offline.html',
];
```

## Testing Locally

### Desktop Testing
```bash
# 1. Start dev server
npm run dev

# 2. Open Chrome DevTools
# Ctrl+Shift+I (Windows/Linux)
# Cmd+Option+I (Mac)

# 3. Go to Application tab
# 4. Check "Service Workers" section
# 5. Should show "Active and running"
```

### Mobile Testing
```bash
# For iOS/Android testing:
# 1. Build for mobile (Expo)
# 2. Test in browser first
# 3. Use mobile dev tools (Chrome Remote)
```

## Testing PWA Features

### Test Offline
1. Start app in browser
2. Open DevTools → Network
3. Check "Offline" checkbox
4. Refresh page
5. Should still load from cache

### Test Installation
Chrome/Edge Desktop:
1. Open app URL
2. Should show install icon
3. Click to install
4. Launches in window

Android:
1. Open in Chrome
2. Tap menu → Install
3. App on home screen

iOS:
1. Open in Safari
2. Tap Share
3. "Add to Home Screen"
4. App on home screen

## Deployment Requirements

### Production Checklist
- [ ] Running on HTTPS (Vercel handles this)
- [ ] Manifest.json valid
- [ ] Icons present
- [ ] Service Worker registered
- [ ] All assets cacheable

### Verify Deployment
```bash
# Use Lighthouse in Chrome DevTools
# Audit tab → PWA
# Score should be 90+

# Or use web.dev
# https://web.dev/measure
```

## Advanced PWA Features

### Sharing Content
```typescript
// Add to component
const shareData = {
  title: 'Check out SkillBridge',
  text: 'Task management with rewards',
  url: 'https://skillbridge.app',
};

navigator.share(shareData);
```

### Installation Prompt
Already implemented in `/public/install.js`:
```typescript
// Shows "Install App" button
// Fires when PWA installable
```

### Background Sync
```typescript
// Sync data when back online
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker.registration.sync.register('sync-data');
}
```

## Troubleshooting

### Service Worker not showing as "Active"
```bash
# Clear cache
# DevTools → Application → Clear site data

# Reload page
# Should show "Active and running"
```

### Can't install app
- Ensure HTTPS (production only)
- Check manifest.json is valid
- Icons must exist
- Check browser support

### Offline page shows
- Service Worker is working!
- Check network connection
- Verify cache has page data

---

For complete deployment guide, see `/README-MULTIPLATFORM.md`
