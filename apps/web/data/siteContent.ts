export const navigationLinks = [
  { href: '/', label: 'Overview' },
  { href: '/roadmap', label: 'Roadmap' },
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

export const learnerBands = [
  {
    title: 'Beginner path',
    range: '₵80 to ₵150',
    summary: 'A learner in Ghana or any other country can start here, even without formal qualifications.',
    points: [
      'Designed for beginners, career changers, and first-time earners',
      'A 22-year-old starter can begin around ₵80 and progress toward ₵150 through completed tasks',
      'Education level changes guidance, not access to opportunities',
    ],
  },
  {
    title: 'Growth path',
    range: '₵150 to ₵220',
    summary: 'Learners who finish starter tasks can choose to learn more, take on public tasks, or upgrade into higher-value work.',
    points: [
      'Supports local and remote earning paths',
      'Encourages portfolio building and skill proof uploads',
      'Keeps task growth based on capability and completion',
    ],
  },
  {
    title: 'Advanced path',
    range: '₵220 and above',
    summary: 'Experienced learners can keep upgrading while still mentoring beginners and sharing downloadable resources.',
    points: [
      'Open to every educational background',
      'Supports public-facing task delivery and advanced submissions',
      'Builds long-term progression from learning into earning',
    ],
  },
];

export const taskCatalog = [
  {
    title: 'Starter digital profile',
    level: 'Beginner',
    pay: 80,
    visibility: 'local',
    description: 'Create a learner profile, choose local or public visibility, and prepare a first skill summary.',
  },
  {
    title: 'Community task support',
    level: 'Beginner',
    pay: 100,
    visibility: 'all',
    description: 'Complete a structured practice task and upload evidence for mentor review.',
  },
  {
    title: 'Public portfolio delivery',
    level: 'Growth',
    pay: 150,
    visibility: 'public',
    description: 'Share a stronger deliverable, publish a profile-ready task outcome, and unlock the next earning band.',
  },
  {
    title: 'Skill upgrade sprint',
    level: 'Growth',
    pay: 180,
    visibility: 'all',
    description: 'Choose to learn more by taking a guided upgrade task with extra accountability.',
  },
  {
    title: 'Advanced client-ready task',
    level: 'Advanced',
    pay: 220,
    visibility: 'public',
    description: 'Deliver a more complex task with downloadable outputs and reviewer-ready evidence.',
  },
];

export const learningResources = [
  { href: '/downloads/beginner-ghana-roadmap.csv', label: 'Beginner Ghana roadmap (.csv)' },
  { href: '/downloads/task-submission-template.txt', label: 'Task submission template (.txt)' },
  { href: '/downloads/public-profile-checklist.md', label: 'Public profile checklist (.md)' },
];

export const educationLevels = [
  'No formal qualification',
  'Basic education',
  'Secondary education',
  'Technical or vocational training',
  'Tertiary education',
  'Self-taught or informal learning',
];

export const countryOptions = ['Ghana', 'Nigeria', 'Kenya', 'South Africa', 'United Kingdom', 'United States', 'Other'];

export const courseRoadmap = [
  {
    title: 'Module 1 · Core product base',
    summary: 'Stabilise the shared workspace so every platform can build from one source of truth.',
    outcomes: [
      'Keep shared auth and data logic in the monorepo',
      'Finish missing scripts and remove fragile placeholders',
      'Validate every workspace before deployment starts',
    ],
  },
  {
    title: 'Module 2 · Member access',
    summary: 'Complete sign-in, create-account, logged-in awareness, and logout across the user journey.',
    outcomes: [
      'Use live Supabase auth instead of mock flows',
      'Surface clear sign-in state in the app shell',
      'Keep signed-out users moving toward access setup',
    ],
  },
  {
    title: 'Module 3 · Multi-platform delivery',
    summary: 'Make web, mobile, and desktop releases follow the same roadmap and ownership model.',
    outcomes: [
      'Treat web as the primary product surface',
      'Keep mobile and desktop aligned with shared logic',
      'Package desktop and mobile from validated builds only',
    ],
  },
  {
    title: 'Module 4 · Automated deployment',
    summary: 'Use repository configuration to automate public and private release flows with review gates.',
    outcomes: [
      'Send public production web deploys to Vercel',
      'Use a private preview channel for Netlify staging builds',
      'Require secrets and passing checks before release jobs run',
    ],
  },
];

export const mentorGuidance = [
  {
    title: 'Protect the core before expanding features',
    summary: 'Your lifetime project needs a stable release base more than a wide but fragile feature surface.',
    actions: [
      'Keep CI green before adding more pages',
      'Promote only one deployment target to production authority',
      'Track incomplete work in the roadmap instead of hiding it',
    ],
  },
  {
    title: 'Separate product work from finance and ownership decisions',
    summary: 'Revenue share, invoices, and business agreements must stay outside repository automation.',
    actions: [
      'Use external billing tools for invoices and payouts',
      'Keep repository roles technical, not financial',
      'Review legal and payment terms manually before automation',
    ],
  },
  {
    title: 'Automate releases, not credentials',
    summary: 'Deployment should be push-button once secrets and platform settings are correctly stored.',
    actions: [
      'Store tokens only in GitHub and hosting provider secrets',
      'Use separate public and private environments',
      'Promote staging builds to production only after review',
    ],
  },
];
