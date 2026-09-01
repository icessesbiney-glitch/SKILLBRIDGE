# Web Deployment Guide

## Hosting Options

### Recommended: Vercel (Easiest)
- Free tier available
- Automatic deployments from Git
- Built-in analytics
- CDN included
- Perfect for Next.js

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel deploy --prod

# Your app is live at https://skillbridge.vercel.app
```

### Alternative: Netlify
```bash
# 1. Connect GitHub
# 2. Configure build: npm run build
# 3. Publish directory: .next
# 4. Auto-deploys on git push
```

### Self-Hosted: AWS, DigitalOcean, Heroku
```bash
# Build
npm run build

# Run
npm start
# Opens on http://localhost:3000
```

## Environment Variables

### Required for Production
```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Set in Hosting Platform
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment
- Self-hosted: Export in .env file (don't commit)

## Pre-Deployment Checklist

- [ ] All tests pass: `npm test`
- [ ] No lint errors: `npm run lint`
- [ ] TypeScript clean: `npm run type-check`
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables set
- [ ] Supabase authentication working
- [ ] Database migrations complete

## Deployment Steps (Vercel)

```bash
# 1. Commit code
git add .
git commit -m "Release v1.0.0"

# 2. Deploy to production
vercel deploy --prod

# 3. Verify deployment
# Open https://your-app.vercel.app

# 4. Update DNS (if custom domain)
# Point nameservers to Vercel
```

## Performance Optimization

### Already Configured
- ✅ Image optimization (Next.js Image)
- ✅ Code splitting
- ✅ CSS minification
- ✅ Compression
- ✅ CDN caching

### Monitor Performance
```bash
# Check page speed
# Visit: https://web.dev/measure
# Input: https://your-app.com

# Expected scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 95+
```

## Analytics Setup

### Vercel Analytics (Free)
Automatically enabled in Vercel dashboard

### Google Analytics
```typescript
// Add to app/layout.tsx
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

## SSL/HTTPS

- ✅ Automatic on Vercel
- ✅ Automatic on Netlify  
- ✅ Free with Let's Encrypt (self-hosted)

## Monitoring & Errors

### Vercel Dashboard
- Deployments
- Analytics
- Error logs
- Performance metrics

### Sentry Integration (Optional)
```bash
npm install @sentry/nextjs
# Connect to Sentry account
# Auto-track errors
```

---

See `README-MULTIPLATFORM.md` for complete guide.
