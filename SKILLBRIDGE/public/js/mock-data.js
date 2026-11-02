// SkillBridge demo data layer — everything lives in localStorage.
// No network calls, no database: this is a front-end-only prototype.

const SB_KEYS = {
  session: 'skillbridge_session',
  members: 'skillbridge_members',
  swaps: 'skillbridge_swaps',
};

const SB_SEED_MEMBERS = [
  { id: 'm-onyekachi', name: 'Onyekachi Idowu', initials: 'OI', offering: 'Upright bass', seeking: 'Conversational Yoruba', city: 'Providence, RI', rating: 4.8, swaps: 11, joined: '2025-02-11' },
  { id: 'm-marguerite', name: 'Marguerite Oduya', initials: 'MO', offering: 'Darkroom printing', seeking: 'Spreadsheet macros', city: 'Missoula, MT', rating: 4.6, swaps: 6, joined: '2025-04-02' },
  { id: 'm-desmond', name: 'Desmond Falk', initials: 'DF', offering: 'Dry-stone walling', seeking: 'Beginner French', city: 'Asheville, NC', rating: 4.9, swaps: 14, joined: '2024-11-19' },
  { id: 'm-priya', name: 'Priya Ramanathan', initials: 'PR', offering: 'React + TypeScript', seeking: 'Wheel-thrown pottery', city: 'Ann Arbor, MI', rating: 4.7, swaps: 9, joined: '2025-01-27' },
  { id: 'm-tobias', name: 'Tobias Krenn', initials: 'TK', offering: 'Sourdough baking', seeking: 'Tax prep for freelancers', city: 'Duluth, MN', rating: 4.5, swaps: 5, joined: '2025-05-14' },
  { id: 'm-yusra', name: 'Yusra Chowdhury', initials: 'YC', offering: 'Mandarin tutoring', seeking: 'Motorcycle maintenance', city: 'Tempe, AZ', rating: 4.9, swaps: 17, joined: '2024-09-03' },
];

const SB_SEED_SWAPS = [
  { id: 's-1', member: 'Onyekachi Idowu', offering: 'Upright bass lessons', seeking: 'Yoruba conversation practice', status: 'active', date: '2026-08-19' },
  { id: 's-2', member: 'Priya Ramanathan', offering: 'React code review', seeking: 'Pottery wheel basics', status: 'pending', date: '2026-08-22' },
  { id: 's-3', member: 'Desmond Falk', offering: 'Dry-stone wall build day', seeking: 'French pronunciation drills', status: 'done', date: '2026-08-06' },
  { id: 's-4', member: 'Tobias Krenn', offering: 'Sourdough starter + bake', seeking: '1099 tax walkthrough', status: 'pending', date: '2026-08-24' },
  { id: 's-5', member: 'Yusra Chowdhury', offering: 'Mandarin tones intro', seeking: 'Chain + brake tune-up', status: 'active', date: '2026-08-15' },
  { id: 's-6', member: 'Marguerite Oduya', offering: 'Film development session', seeking: 'Excel macro cleanup', status: 'done', date: '2026-07-29' },
];

function sbLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

function sbSave(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function sbSeedIfEmpty() {
  if (!localStorage.getItem(SB_KEYS.members)) {
    sbSave(SB_KEYS.members, SB_SEED_MEMBERS);
  }
  if (!localStorage.getItem(SB_KEYS.swaps)) {
    sbSave(SB_KEYS.swaps, SB_SEED_SWAPS);
  }
}

function sbResetDemoData() {
  sbSave(SB_KEYS.members, SB_SEED_MEMBERS);
  sbSave(SB_KEYS.swaps, SB_SEED_SWAPS);
}
