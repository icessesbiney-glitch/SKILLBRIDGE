export const navigationLinks = [
  { href: '/', label: 'Overview' },
  { href: '/dashboard', label: 'Operations' },
  { href: '/team', label: 'Team' },
  { href: '/auth', label: 'Access' },
];

export const platforms = [
  {
    name: 'Web application',
    status: 'Ready for CI validation',
    description:
      'Next.js workspace with a richer landing experience, operational dashboard, and deployment-aware access flow.',
  },
  {
    name: 'Desktop application',
    status: 'Prepared for packaged release',
    description:
      'Electron now falls back to a stable hosted entry point so packaged builds are not tied to a missing local export.',
  },
  {
    name: 'Mobile application',
    status: 'Prepared for Expo builds',
    description:
      'Expo configuration and asset references are aligned so EAS can build from valid project metadata.',
  },
  {
    name: 'Shared workspace',
    status: 'Supporting all apps',
    description:
      'Shared auth and data utilities remain centralised for cross-platform features and future Supabase expansion.',
  },
];

export const workstreams = [
  {
    title: 'Structure repair',
    items: ['Replace placeholder sections', 'Organise app navigation', 'Surface incomplete work clearly'],
  },
  {
    title: 'Team readiness',
    items: ['Define owners per platform', 'Track blockers and handoffs', 'Expose deployment responsibilities'],
  },
  {
    title: 'Deployment repair',
    items: ['Stop masking failing builds', 'Repair invalid config files', 'Provide missing required assets'],
  },
];

export const roadmap = [
  {
    phase: 'Foundation',
    summary: 'Stabilise builds, assets, and workspace configuration so every app can be validated consistently.',
  },
  {
    phase: 'Feature completion',
    summary: 'Replace mocks with live data flows and finish the remaining account, team, and reporting sections.',
  },
  {
    phase: 'Launch operations',
    summary: 'Connect production secrets, run release workflows, and monitor rollout across web, desktop, and mobile.',
  },
];

export const teamMembers = [
  {
    name: 'Product coordination',
    role: 'Scope and release owner',
    focus: 'Keeps incomplete sections, rollout order, and stakeholder feedback aligned.',
  },
  {
    name: 'Web delivery',
    role: 'Next.js experience owner',
    focus: 'Maintains customer-facing pages, auth flow messaging, and operational visibility.',
  },
  {
    name: 'Mobile delivery',
    role: 'Expo and EAS owner',
    focus: 'Owns native build configuration, internal distribution, and asset compliance.',
  },
  {
    name: 'Desktop delivery',
    role: 'Electron release owner',
    focus: 'Keeps packaged builds stable and aligned with the deployed web experience.',
  },
];

export const deploymentSteps = [
  {
    title: 'Repository validation',
    detail: 'Run lint, type-check, tests, and the production web build without suppressing failures.',
  },
  {
    title: 'Platform secrets',
    detail: 'Configure Supabase, Vercel, and Expo credentials in GitHub before enabling automatic releases.',
  },
  {
    title: 'Release execution',
    detail: 'Publish the web app from main, distribute mobile previews through EAS, and cut tagged desktop releases.',
  },
];
