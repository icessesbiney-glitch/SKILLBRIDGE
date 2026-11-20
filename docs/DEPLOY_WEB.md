# Web Deployment

The current web deployment process, required environment-variable names, Supabase prerequisites, Paystack webhook setup, and non-deployment safeguards are documented in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

The production workflow deploys the `apps/web` workspace to Vercel from `main`. The private-preview workflow builds from the repository root and publishes to Netlify on push events for `main` and `develop`. Pull requests run validation only.

Before any authorized release, run the checks from the deployment guide and verify production environment settings in the hosting dashboard. Driver, rider, GPS, dispatch, and delivery functionality remains deferred until 2029.
