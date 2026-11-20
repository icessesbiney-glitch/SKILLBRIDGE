# Mobile Companion Status

The current Expo app is a companion entry point to the web application. It does not
provide driver, rider, dispatch, GPS-tracking, or delivery workflows; those sectors
are deferred until 2029.

The root CI workflow checks Expo dependency alignment and performs an Android bundle
export. This validates the companion app but does not publish it. No mobile
publishing workflow is active in the root `.github/workflows` directory.

Set `EXPO_PUBLIC_WEB_URL` to the HTTPS web origin for a companion build. Do not
configure publishing credentials or distribute a build without separate release
authorization. See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for the current
release configuration.
