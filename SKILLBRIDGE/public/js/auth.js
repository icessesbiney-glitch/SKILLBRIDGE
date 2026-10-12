// SkillBridge mock auth — a client-only session flag for gating the demo
// owner dashboard. This is NOT real authentication: any email/password is
// accepted and the "session" is just a localStorage entry. Do not treat
// this as access control for real data.

function sbGetSession() {
  return sbLoad(SB_KEYS.session, null);
}

function sbLogin(name, email) {
  const cleanName = (name || '').trim() || email.split('@')[0];
  const session = {
    name: cleanName,
    email: email.trim(),
    role: 'owner',
    since: new Date().toISOString(),
  };
  sbSave(SB_KEYS.session, session);
  return session;
}

function sbLogout() {
  localStorage.removeItem(SB_KEYS.session);
}

// Client-side gate only — redirects if no local session exists. Since there
// is no server, this offers no real security; it just keeps the demo flow
// coherent (owner dashboard "feels" protected while running fully offline).
function sbRequireSession(redirectTo) {
  const session = sbGetSession();
  if (!session) {
    window.location.href = redirectTo || 'login.html';
    return null;
  }
  return session;
}
