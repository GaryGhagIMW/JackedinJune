/** Live leaderboard — public charts (no Microsoft login required) */
const CHART_COLORS = ['#3b9eff', '#f5c842', '#34d399', '#a78bfa', '#f472b6', '#fb923c', '#38bdf8'];
let charts = {};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dashboard-refresh')?.addEventListener('click', () => loadDashboard(true));
  loadDashboard();
  setInterval(() => loadDashboard(), 60000);
});
document.addEventListener('jij:submitted', () => loadDashboard(true));

async function fetchSubmissionRows() {
  const url = window.DASHBOARD_URL || '';
  if (!url) throw new Error('Dashboard read URL not configured');

  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`Dashboard API ${res.status}`);
  const data = await res.json();
  return normalizeRows(data);
}

function normalizeRows(data) {
  if (Array.isArray(data)) return data.map(normalizeRow);
  if (Array.isArray(data?.rows)) return data.rows.map(normalizeRow);
  if (Array.isArray(data?.value)) return data.value.map(normalizeRow);
  return [];
}

function normalizeRow(row) {
  return {
    team: String(row.Team ?? row.team ?? '').trim(),
    member: String(row.Member ?? row.member ?? '').trim(),
    activity: String(row.Activity ?? row.activity ?? '').trim(),
    points: parseFloat(row.Points ?? row.points ?? 0) || 0,
  };
}

function aggregateMetrics(rows) {
  const byTeam = {};
  const byMember = {};
  const byActivity = {};
  const members = new Set();

  rows.forEach((r) => {
    if (!r.team || !r.member) return;
    members.add(r.member);
    byTeam[r.team] = (byTeam[r.team] || 0) + r.points;
    byMember[r.member] = (byMember[r.member] || 0) + r.points;
    byActivity[r.activity || 'Unknown'] = (byActivity[r.activity || 'Unknown'] || 0) + r.points;
  });

  const topActivity = Object.entries(byActivity).sort((a, b) => b[1] - a[1])[0];

  return {
    totalPoints: rows.reduce((s, r) => s + r.points, 0),
    totalEntries: rows.length,
    activeMembers: members.size,
    topActivity: topActivity ? topActivity[0] : '—',
    byTeam,
    byMember,
    byActivity,
  };
}

function sortEntries(obj, limit = 10) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

async function loadDashboard(manual = false) {
  const statusEl = document.getElementById('dashboard-status');
  const chartsEl = document.getElementById('dashboard-charts');
  const setupEl = document.getElementById('dashboard-setup-notice');

  try {
    if (manual && statusEl) statusEl.textContent = 'Refreshing…';

    const rows = await fetchSubmissionRows();
    const metrics = aggregateMetrics(rows);

    setupEl?.classList.add('hidden');
    chartsEl?.classList.remove('hidden');

    renderKPIs(metrics);
    renderCharts(metrics);
    renderLeaderboards(metrics);

    if (statusEl) statusEl.textContent = `${rows.length} submissions · Updated ${new Date().toLocaleTimeString()}`;
  } catch {
    setupEl?.classList.remove('hidden');
    chartsEl?.classList.add('hidden');
    if (statusEl) statusEl.textContent = 'Leaderboard loads after the read flow is connected (see notice below)';
  }
}

function renderKPIs(m) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set('kpi-total-points', formatPoints(m.totalPoints));
  set('kpi-total-entries', m.totalEntries);
  set('kpi-active-members', m.activeMembers);
  set('kpi-top-activity', m.topActivity);
}

function renderCharts(m) {
  const teamData = sortEntries(m.byTeam, 10);
  const memberData = sortEntries(m.byMember, 10);
  const activityData = sortEntries(m.byActivity, 12);

  upsertChart('chart-teams', 'bar', {
    labels: teamData.map(([k]) => k),
    datasets: [{ label: 'Points', data: teamData.map(([, v]) => v), backgroundColor: CHART_COLORS, borderRadius: 6 }],
  }, { indexAxis: 'y' });

  upsertChart('chart-members', 'bar', {
    labels: memberData.map(([k]) => k),
    datasets: [{ label: 'Points', data: memberData.map(([, v]) => v), backgroundColor: '#3b9eff', borderRadius: 6 }],
  }, { indexAxis: 'y' });

  upsertChart('chart-activities', 'doughnut', {
    labels: activityData.map(([k]) => k),
    datasets: [{
      data: activityData.map(([, v]) => v),
      backgroundColor: CHART_COLORS.concat(['#64748b', '#94a3b8']),
      borderWidth: 0,
    }],
  });
}

function upsertChart(canvasId, type, data, extraOptions = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: type === 'doughnut', labels: { color: '#f0f4fc' } } },
    scales:
      type !== 'doughnut'
        ? {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } },
          }
        : undefined,
    ...extraOptions,
  };

  if (charts[canvasId]) {
    charts[canvasId].data = data;
    charts[canvasId].update();
    return;
  }
  charts[canvasId] = new Chart(canvas, { type, data, options });
}

function renderLeaderboards(m) {
  const teamList = document.getElementById('leaderboard-teams');
  const memberList = document.getElementById('leaderboard-members');
  const teamRows = sortEntries(m.byTeam, 5);
  const memberRows = sortEntries(m.byMember, 10);

  if (teamList) {
    teamList.innerHTML = teamRows.length
      ? teamRows
          .map(
            ([name, pts], i) =>
              `<li class="leaderboard-item"><span class="rank">#${i + 1}</span><span class="name">${name}</span><span class="pts">${formatPoints(pts)} pts</span></li>`
          )
          .join('')
      : '<li class="leaderboard-empty">No data yet</li>';
  }
  if (memberList) {
    memberList.innerHTML = memberRows.length
      ? memberRows
          .map(
            ([name, pts], i) =>
              `<li class="leaderboard-item"><span class="rank">#${i + 1}</span><span class="name">${name}</span><span class="pts">${formatPoints(pts)} pts</span></li>`
          )
          .join('')
      : '<li class="leaderboard-empty">No data yet</li>';
  }
}
