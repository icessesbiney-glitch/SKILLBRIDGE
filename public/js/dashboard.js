// SkillBridge owner dashboard rendering — pulls everything from localStorage.

function sbInitials(name) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function sbRenderStats(members, swaps) {
  const active = swaps.filter((s) => s.status === 'active').length;
  const pending = swaps.filter((s) => s.status === 'pending').length;
  const avgRating = members.length
    ? (members.reduce((sum, m) => sum + m.rating, 0) / members.length).toFixed(2)
    : '0.00';

  document.getElementById('stat-members').textContent = members.length;
  document.getElementById('stat-active').textContent = active;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-rating').textContent = avgRating;
}

function sbBadgeClass(status) {
  if (status === 'active') return 'badge-active';
  if (status === 'pending') return 'badge-pending';
  return 'badge-done';
}

function sbRenderSwaps(swaps) {
  const body = document.getElementById('swaps-body');
  body.innerHTML = '';
  swaps
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .forEach((s) => {
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `
        <div>${s.member}</div>
        <div>${s.offering}</div>
        <div>${s.seeking}</div>
        <div><span class="badge ${sbBadgeClass(s.status)}">${s.status}</span></div>
        <div class="mono" style="color:var(--ink-faint);">${s.date}</div>
      `;
      body.appendChild(row);
    });
}

function sbRenderMembers(members) {
  const list = document.getElementById('members-list');
  list.innerHTML = '';
  members.forEach((m) => {
    const item = document.createElement('div');
    item.className = 'member-card';
    item.innerHTML = `
      <div class="avatar">${sbInitials(m.name)}</div>
      <div style="flex:1;">
        <div class="who">${m.name}</div>
        <div class="loc mono">${m.city}</div>
        <div class="skills">
          <span class="pill">offers ${m.offering}</span>
          <span class="pill pill-seek">wants ${m.seeking}</span>
        </div>
      </div>
      <div class="member-meta">
        <div class="mono">${m.rating.toFixed(1)}★</div>
        <div class="mono" style="color:var(--ink-faint);">${m.swaps} swaps</div>
      </div>
    `;
    list.appendChild(item);
  });
}

function sbRenderAll() {
  const members = sbLoad(SB_KEYS.members, []);
  const swaps = sbLoad(SB_KEYS.swaps, []);
  sbRenderStats(members, swaps);
  sbRenderSwaps(swaps);
  sbRenderMembers(members);
}
