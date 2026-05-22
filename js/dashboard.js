/**
 * Jacked in June 2026 — live leaderboard & KPI dashboard
 */

const CHART_COLORS = ['#3b9eff', '#f5c842', '#34d399', '#a78bfa', '#f472b6', '#fb923c', '#38bdf8'];
let charts = {};
let refreshTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

document.addEventListener('jij:submitted', () => loadDashboard(true));

function initDashboard() {
  const refreshBtn = document.getElementById('dashboard-refresh');
  refreshBtn?.addEventListener('click', () => loadDashboard(true));

  loadDashboard();
  refreshTimer = setInterval(() => loadDashboard(), 60000);
}

async function fetchSubmissionRows() {
  const sources = [];

  if (typeof DASHBOARD_URL === 'string' && DASHBOARD_URL) {
    sources.push(async () => {
      const res = await fetch(DASHBOARD_URL, { method: 'GET' });
      if (!res.ok) throw new Error(`Dashboard API ${res.status}`);
      const data = await res.json();
      return normalizeRows(data);
    });
  }

  sources.push(async () => {
    const res = await fetch('/api/dashboard');
    if (!res.ok) throw new Error('Local dashboard unavailable');
    const data = await res.json();
    return normalizeRows(data);
  });

  let lastError;
  for (const load of sources) {
    try {
      return await load();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('No dashboard data source configured');
}

function normalizeRows(data) {
  if (Array.isArray(data)) return data.map(normalizeRow);
  if (Array.isArray(data?.rows)) return data.rows.map(normalizeRow);
  if (Array.isArray(data?.value)) return data.value.map(normalizeRow);
  return [];
}

function normalizeRow(row) {
  const points = parseFloat(row.Points ?? row.points ?? 0) || 0;
  return {
    timestamp: row.Timestamp ?? row.timestamp ?? '',
    team: (row.Team ?? row.team ?? '').trim(),
    member: (row.Member ?? row.member ?? '').trim(),
    activity: (row.Activity ?? row.activity ?? '').trim(),
    durationMinutes: row.DurationMinutes ?? row.durationMinutes ?? '',
    steps: row.Steps ?? row.steps ?? '',
    points,
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
  const updatedEl = document.getElementById('dashboard-updated');

  try {
    if (manual && statusEl) statusEl.textContent = 'Refreshing…';

    const rows = await fetchSubmissionRows();
    const metrics = aggregateMetrics(rows);

    renderKPIs(metrics);
    renderCharts(metrics);
    renderLeaderboards(metrics);

    if (statusEl) statusEl.textContent = rows.length ? `${rows.length} submissions loaded` : 'No submissions yet';
    if (updatedEl) updatedEl.textContent = `Updated ${new Date().toLocaleTimeString()}`;
  } catch (err) {
    if (statusEl) {
      statusEl.textContent =
        typeof DASHBOARD_URL === 'string' && DASHBOARD_URL
          ? 'Could not load dashboard data'
          : 'Live stats — configure DASHBOARD_URL or use start-server.bat';
    }
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
    datasets: [{
      label: 'Team Points',
      data: teamData.map(([, v]) => v),
      backgroundColor: CHART_COLORS,
      borderRadius: 6,
    }],
  }, { indexAxis: 'y' });

  upsertChart('chart-members', 'bar', {
    labels: memberData.map(([k]) => k),
    datasets: [{
      label: 'Member Points',
      data: memberData.map(([, v]) => v),
      backgroundColor: '#3b9eff',
      borderRadius: 6,
    }],
  }, { indexAxis: 'y' });

  upsertChart('chart-activities', 'doughnut', {
    labels: activityData.map(([k]) => k),
    datasets: [{
      data: activityData.map(([, v]) => v),
      backgroundColor: CHART_COLORS.concat(['#64748b', '#94a3b8', '#cbd5e1']),
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
    plugins: {
      legend: { display: type === 'doughnut', labels: { color: '#f0f4fc' } },
    },
    scales: type !== 'doughnut' ? {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } },
    } : undefined,
    ...extraOptions,
  };

  if (charts[canvasId]) {
    charts[canvasId].data = data;
    charts[canvasId].options = options;
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
            ([name, pts], i) => `
        <li class="leaderboard-item">
          <span class="rank">#${i + 1}</span>
          <span class="name">${name}</span>
          <span class="pts">${formatPoints(pts)} pts</span>
        </li>`
          )
          .join('')
      : '<li class="leaderboard-empty">No team data yet</li>';
  }

  if (memberList) {
    memberList.innerHTML = memberRows.length
      ? memberRows
          .map(
            ([name, pts], i) => `
        <li class="leaderboard-item">
          <span class="rank">#${i + 1}</span>
          <span class="name">${name}</span>
          <span class="pts">${formatPoints(pts)} pts</span>
        </li>`
          )
          .join('')
      : '<li class="leaderboard-empty">No member data yet</li>';
  }
}
