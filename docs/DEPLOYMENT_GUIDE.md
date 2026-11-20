# SkillBridge Deployment Guide

This guide describes the deployment configuration currently present in this repository. Do not deploy, publish, or modify production data without the required owner authorization.

## Current release scope

- The web application is the production marketplace, account, and wallet surface.
- The Expo app is a companion that opens the configured web application; it does not provide driver or delivery workflows.
- Driver, rider, GPS-tracking, dispatch, and delivery features are deferred until 2029. Do not enable their routes or apply `supabase/migrations/20261007_admin_gps_tracking.sql` for this launch.
- No mobile publishing workflow is active in the root `.github/workflows` directory. CI validates an Android export but does not publish an app.

## Web hosting

### Vercel production

The root `.github/workflows/deploy-web-production.yml` workflow validates and deploys on pushes to `main` when the web or shared workspace changes, and supports manual dispatch. The Vercel action deploys from `apps/web`.

Configure these GitHub environment values/secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `NEXT_PUBLIC_URL`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Configure the following server-only variables in the Vercel project for the production runtime. Never prefix these with `NEXT_PUBLIC_`:

- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY`
- `NATIONAL_ID_HASH_SECRET`

The GitHub workflow requires the public Supabase settings and `NEXT_PUBLIC_URL` to build, then fails if any Vercel deployment secret is missing.

### Netlify preview

The root `.github/workflows/deploy-web-private.yml` validates on pushes and pull requests targeting `main` or `develop`; push/manual events also publish a Netlify preview. The repository-root `netlify.toml` defines the build command. Configure:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `NEXT_PUBLIC_URL`
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

Set the server-only runtime variables listed above in the hosting environment if the preview needs authenticated server-side or payment functionality.

### Local web checks

From the repository root:

```bash
npm ci --legacy-peer-deps
npm run type-check
npm run lint --workspace=@skillbridge/web
npm test
npm run build
```

## Supabase and payments

The migration directory does not contain a complete baseline schema. Confirm the target database already has the required application tables and functions, and review each migration against the live migration history before applying anything. The wallet migrations depend on existing `profiles`, `platform_wallets`, and `ledger_entries` tables. `20261127_cashout_wallet_debit.sql` supplies the wallet-debit function used by cashout; the migration must be applied to the intended database before cashouts can work. Do not apply migrations to production as part of this deployment task.

Configure the Paystack webhook to call `/api/paystack-webhook` on the production origin and keep the provider secret in `PAYSTACK_SECRET_KEY`. Confirm the configured webhook behavior and database schema with the service owner before enabling live money movement.

## Mobile companion

Set `EXPO_PUBLIC_WEB_URL` to the HTTPS production web origin when preparing a mobile companion build. The current mobile validation command checks Expo package alignment and exports an Android bundle:

```bash
npm run validate:mobile
```

This is a validation/export check, not an app-store or EAS publishing workflow. Do not configure mobile publishing credentials or distribute a build without separate release authorization.
