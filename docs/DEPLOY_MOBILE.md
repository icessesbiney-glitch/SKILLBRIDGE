# Mobile App Status

The current Expo app is a rider and delivery application. Driver onboarding, location
tracking, dispatch, and delivery are explicitly deferred until 2029 and are not part
of the current launch.

The app now displays a non-operational notice and does not request location
permissions or send telemetry. Its automated private-distribution workflow has been
archived at [docs/deferred/deploy-mobile-private.yml](./deferred/deploy-mobile-private.yml)
so GitHub Actions cannot build or publish it.

Do not configure mobile publishing credentials or distribute builds during the
current launch. The archived source and workflow are retained for future work.
