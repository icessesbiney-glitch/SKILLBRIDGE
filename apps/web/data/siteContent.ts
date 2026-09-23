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
];

export const workstreams = [
  {
    title: 'Structure repair',
    items: ['Replace placeholder sections', 'Organise app navigation', 'Surface incomplete work clearly'],
  },
];

export const roadmap = [
  {
    phase: 'Foundation',
    summary: 'Stabilise builds, assets, and workspace configuration so every app can be validated consistently.',
  },
];

export const faqs = [
  {
    key: "faq-1",
    question: "What is SkillBridge?",
    answer: "SkillBridge is an online training and platform ecosystem offering comprehensive practical skill building in areas like export business, studying abroad, personal development, and global marketing. We help individuals unlock premium learning tracks through modern, live transactional tools."
  },
  {
    key: "faq-2",
    question: "What payment methods are used at Skillbridge?",
    answer: "We process all financial transactions securely through Dodo Payments. You can securely purchase premium access using local Mobile Money (MTN MoMo, Telecel Cash, AT Money), debit cards, or global currency structures seamlessly with instant processing."
  }
];

export const courseRoadmap = [
  {
    title: 'Module 1 · Core product base',
    summary: 'Stabilise the shared workspace so every platform can build from one source of truth.',
    outcomes: [
      'Keep shared auth and data logic in the monorepo',
      'Finish missing scripts and remove fragile placeholders',
      'Validate every workspace before deployment starts'
    ]
  }
];

export const mentorGuidance = [
  {
    title: 'Protect the core before expanding features',
    summary: 'Your lifetime project needs a stable release base more than a wide but fragile feature surface.',
    actions: [
      'Keep CI green before adding more pages'
    ]
  }
];
