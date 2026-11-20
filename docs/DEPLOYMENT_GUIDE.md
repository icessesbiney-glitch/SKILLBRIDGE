# SkillBridge Deployment Guide

This guide describes the deployment configuration currently present in this repository. Do not deploy, publish, or modify production data without the required owner authorization.

## Current release scope

- The web application is the production marketplace, account, and wallet surface.
- The Expo app is a companion that opens the configured web application; it does not provide driver or delivery workflows.
- Driver, rider, GPS-tracking, dispatch, and delivery features are deferred until 2029. Do not enable their routes or apply `supabase/migrations/20261007_admin_gps_tracking.sql` for this launch.
- No mobile publishing workflow is active in the root `.github/workflows` directory. CI validates an Android export but does not publish an app.

## Web hosting

### Vercel production

The root `.github/workflows/deploy-web-production.yml` workflow validates and deploys on pushes to `main` when the web or shared workspace changes, and supports manual dispatch. Vercel must use the repository root as its project Root Directory; [`vercel.json`](../vercel.json) installs the npm workspaces and builds `@skillbridge/web`.

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

The GitHub workflow requires the public Supabase settings and `NEXT_PUBLIC_URL` to build, then fails if any Vercel deployment secret is missing. Set the three server-only runtime variables in Vercel separately; they are not required by the client build and must never be copied into GitHub build arguments.

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

### Release and rollback

1. Confirm the Vercel project Root Directory is the repository root and that the production environment contains the variables above.
2. Verify the target Supabase database and its migration history with the database owner. The repository has no complete baseline schema, so do not assume a fresh database is supported.
3. Configure the Paystack live webhook URL as `https://<production-origin>/api/paystack-webhook` in the Paystack dashboard; verify the live secret is stored as `PAYSTACK_SECRET_KEY`.
4. Review the CI run and the generated Vercel deployment before authorizing a production release. The workflow deploys on `main`; this guide does not authorize a deployment.
5. To roll back web code, promote/redeploy the last known-good immutable Vercel deployment from the Vercel project dashboard. Confirm its required environment variables remain configured. Do not reverse database migrations automatically; use a reviewed forward migration if a schema correction is needed.
6. For Netlify previews, republish the last known-good deploy from the Netlify deploy history. Preview rollback does not roll back Supabase data.

Configure host-level request rate limits/abuse protection for authenticated account, checkout, and cashout endpoints before public launch. Application checks serialize cashouts per user, but they are not a substitute for deployment-level traffic controls.

## Supabase and payments

The migration directory does not contain a complete baseline schema. Confirm the target database already has the required application tables and functions, and review each migration against the live migration history before applying anything. The wallet migrations depend on existing `profiles`, `platform_wallets`, and `ledger_entries` tables. Apply only missing migrations in filename order after owner review: `20261106_wallet_hardening.sql`, `20261120_paystack_wallet_integrity.sql`, `20261127_cashout_wallet_debit.sql`, then `20261128_cashout_state_guard.sql`. The final migration replaces the unsafe three-argument reversal function; it is required before cashouts are enabled. Cashout requests stay blocked while an earlier transfer is unresolved, preventing duplicate payouts. Do not apply migrations to production as part of this task.

Before applying those migrations, confirm `profiles`, `platform_wallets`, `ledger_entries`, and `paystack_transactions` exist with the columns/functions referenced by the scripts, inspect current ledger references for duplicates, and verify that prior migrations are recorded as applied. The SQL files are transactional database changes and have not been tested against the live schema in this workspace; owner review and a non-production staging run are required. Never run the GPS/delivery migration for this launch.

Configure the Paystack webhook to call `/api/paystack-webhook` on the production origin and keep the provider secret in `PAYSTACK_SECRET_KEY`. Confirm the configured webhook behavior and database schema with the service owner before enabling live money movement.

## Dependency audit status

The production-only audit reports three moderate findings for `minimatch` 10.2.6, reached through Expo 58.0.26 and `@expo/fingerprint` 0.21.10. The advisory describes denial of service through glob-pattern amplification. The available automatic Expo fix would downgrade from SDK 58 to SDK 52, reversing the completed SDK migration, so it was not applied. Keep Expo CLI use in trusted builds, review changes to fingerprint ignore patterns, and revisit when Expo updates this dependency.

The full audit reports 30 findings (21 moderate, eight high, one critical):

| Scope | Dependencies | Impact and mitigation |
|---|---|---|
| Mobile build tooling | `expo` 58.0.26, `@expo/fingerprint` 0.21.10, `minimatch` 10.2.6 | Three moderate findings; keep Expo CLI use in trusted builds and update when Expo supplies a compatible fix. |
| Test tooling | Jest 30.5.2 / `@jest/*`, `glob` 13.0.7, `test-exclude` 7.0.2, `config-file-ts` 0.2.6 | Moderate findings in test and glob-pattern processing; current automatic fixes downgrade Jest to 29.7.0 or have no safe fix. Do not feed untrusted patterns to test tooling; these packages are not deployed as web/mobile runtime code. |
| Legacy desktop packaging | `electron` 27.3.11, `electron-builder` 24.13.3, `tar` 6.2.1, `extract-zip` | Eight high and one critical finding in packaging/runtime dependencies. Fixes require major desktop-toolchain upgrades. Desktop builds are outside the currently validated web/mobile launch scope; do not create a desktop production tag or dispatch its workflows until dependencies and workflow paths are corrected and cross-platform builds are verified. See [DEPLOY_DESKTOP.md](./DEPLOY_DESKTOP.md). |

## Mobile companion

Set `EXPO_PUBLIC_WEB_URL` to the HTTPS production web origin when preparing a mobile companion build. The current mobile validation command checks Expo package alignment and exports an Android bundle:

```bash
npm run validate:mobile
```

This is a validation/export check, not an app-store or EAS publishing workflow. Do not configure mobile publishing credentials or distribute a build without separate release authorization.
