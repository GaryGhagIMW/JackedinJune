let sessionLog = [];
let selectedActivityId = 'running';

document.addEventListener('DOMContentLoaded', () => {
  renderActivityCards();
  populateTeams();
  bindEvents();
  updateSessionUI();
});

function renderActivityCards() {
  const grid = document.getElementById('activity-grid');
  if (!grid) return;

  grid.innerHTML = ACTIVITIES.map(
    (a) => `
    <button type="button" class="activity-card${a.id === selectedActivityId ? ' selected' : ''}"
            data-activity="${a.id}" aria-pressed="${a.id === selectedActivityId}">
      <span class="activity-icon">${a.icon}</span>
      <span class="activity-name">${a.name}</span>
      <span class="activity-pts">${a.pointsPerHour} pts/hr</span>
    </button>`
  ).join('');
}

function populateTeams() {
  const teamSelect = document.getElementById('team');
  const memberSelect = document.getElementById('member');
  if (!teamSelect || !memberSelect) return;

  teamSelect.innerHTML = Object.entries(TEAMS)
    .map(
      ([id, team]) =>
        `<option value="${id}">${team.name}</option>`
    )
    .join('');

  teamSelect.addEventListener('change', updateMembers);
  updateMembers();
}

function updateMembers() {
  const teamId = document.getElementById('team').value;
  const memberSelect = document.getElementById('member');
  const members = TEAMS[teamId]?.members ?? [];

  memberSelect.innerHTML = members
    .map((m) => `<option value="${m}">${m}</option>`)
    .join('');
}

function bindEvents() {
  document.getElementById('activity-grid')?.addEventListener('click', (e) => {
    const card = e.target.closest('[data-activity]');
    if (!card) return;
    selectedActivityId = card.dataset.activity;
    renderActivityCards();
    updateInputMode();
    updatePreview();
  });

  ['minutes', 'steps'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', updatePreview);
  });

  document.getElementById('add-activity')?.addEventListener('click', addToSession);
  document.getElementById('submit-all')?.addEventListener('click', submitSession);
  document.getElementById('clear-session')?.addEventListener('click', clearSession);

  document.getElementById('track-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (sessionLog.length === 0) {
      addToSession();
    }
    submitSession();
  });

  updateInputMode();
  updatePreview();
}

function updateInputMode() {
  const activity = getActivityById(selectedActivityId);
  const stepsGroup = document.getElementById('steps-group');
  const minutesLabel = document.getElementById('minutes-label');

  if (activity?.inputType === 'duration-or-steps') {
    stepsGroup?.classList.remove('hidden');
    if (minutesLabel) minutesLabel.textContent = 'Duration (minutes) — optional if using steps';
  } else {
    stepsGroup?.classList.add('hidden');
    if (minutesLabel) minutesLabel.textContent = 'Duration (minutes)';
    const stepsInput = document.getElementById('steps');
    if (stepsInput) stepsInput.value = '';
  }

  const hint = document.getElementById('activity-hint');
  if (hint && activity) hint.textContent = activity.description;
}

function getInputValues() {
  const minutes = parseFloat(document.getElementById('minutes')?.value) || 0;
  const steps = parseInt(document.getElementById('steps')?.value, 10) || 0;
  return { minutes, steps };
}

function updatePreview() {
  const activity = getActivityById(selectedActivityId);
  const { minutes, steps } = getInputValues();
  const points = calculatePoints(selectedActivityId, minutes, steps);

  const preview = document.getElementById('points-preview');
  if (preview) {
    preview.textContent = formatPoints(points);
    preview.classList.toggle('has-value', points > 0);
  }

  const breakdown = document.getElementById('points-breakdown');
  if (breakdown && activity) {
    if (points <= 0) {
      breakdown.textContent = 'Enter duration or steps to see your score';
    } else if (activity.inputType === 'duration-or-steps' && steps > 0 && minutes <= 0) {
      breakdown.textContent = `${steps.toLocaleString()} steps → ${formatPoints(points)} points`;
    } else {
      breakdown.textContent = `${minutes} min of ${activity.name} → ${formatPoints(points)} points`;
    }
  }
}

function addToSession() {
  const team = document.getElementById('team')?.value;
  const member = document.getElementById('member')?.value;
  const activity = getActivityById(selectedActivityId);
  const { minutes, steps } = getInputValues();
  const points = calculatePoints(selectedActivityId, minutes, steps);

  if (!team || !member) {
    showToast('Please select your team and name.', 'error');
    return;
  }

  if (points <= 0) {
    showToast('Enter a valid duration or step count.', 'error');
    return;
  }

  sessionLog.push({
    id: crypto.randomUUID(),
    team,
    member,
    activityId: selectedActivityId,
    activityName: activity.name,
    minutes,
    steps,
    points,
    icon: activity.icon,
  });

  document.getElementById('minutes').value = '';
  document.getElementById('steps').value = '';
  updatePreview();
  updateSessionUI();
  showToast(`${activity.name} added — ${formatPoints(points)} pts`, 'success');
}

function removeFromSession(id) {
  sessionLog = sessionLog.filter((entry) => entry.id !== id);
  updateSessionUI();
}

function clearSession() {
  if (sessionLog.length && !confirm('Clear all activities from this session?')) return;
  sessionLog = [];
  updateSessionUI();
}

function updateSessionUI() {
  const list = document.getElementById('session-list');
  const totalEl = document.getElementById('session-total');
  const countEl = document.getElementById('session-count');
  const submitBtn = document.getElementById('submit-all');

  const total = sessionLog.reduce((sum, e) => sum + e.points, 0);

  if (totalEl) {
    animateCounter(totalEl, total);
  }
  if (countEl) countEl.textContent = sessionLog.length;

  if (list) {
    if (sessionLog.length === 0) {
      list.innerHTML = `<li class="session-empty">No activities logged yet — add one above!</li>`;
    } else {
      list.innerHTML = sessionLog
        .map(
          (e) => `
        <li class="session-item">
          <span class="session-item-icon">${e.icon}</span>
          <div class="session-item-body">
            <strong>${e.activityName}</strong>
            <span>${e.minutes > 0 ? `${e.minutes} min` : ''}${e.steps > 0 ? `${e.minutes > 0 ? ' · ' : ''}${e.steps.toLocaleString()} steps` : ''}</span>
          </div>
          <span class="session-item-pts">${formatPoints(e.points)} pts</span>
          <button type="button" class="session-remove" data-remove="${e.id}" aria-label="Remove">×</button>
        </li>`
        )
        .join('');

      list.querySelectorAll('[data-remove]').forEach((btn) => {
        btn.addEventListener('click', () => removeFromSession(btn.dataset.remove));
      });
    }
  }

  if (submitBtn) submitBtn.disabled = sessionLog.length === 0;
}

function animateCounter(el, target) {
  const current = parseFloat(el.dataset.value) || 0;
  if (current === target) {
    el.textContent = formatPoints(target);
    return;
  }
  el.dataset.value = target;
  el.classList.add('pulse');
  el.textContent = formatPoints(target);
  setTimeout(() => el.classList.remove('pulse'), 400);
}

async function submitSession() {
  if (sessionLog.length === 0) {
    showToast('Add at least one activity before submitting.', 'error');
    return;
  }

  const submitBtn = document.getElementById('submit-all');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting…';

  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const entries = sessionLog.map((entry) => ({
    Timestamp: timestamp,
    Team: entry.team,
    Member: entry.member,
    Activity: entry.activityName,
    TimeValue:
      entry.steps > 0 && entry.minutes <= 0
        ? String(entry.steps) + ' steps'
        : String(entry.minutes),
    Points: String(entry.points),
  }));

  let submitted = false;

  if (SUBMIT_MODE === 'powerautomate' || SUBMIT_MODE === 'auto') {
    submitted = await submitToPowerAutomate(entries);
  }

  if (!submitted && (SUBMIT_MODE === 'local' || SUBMIT_MODE === 'auto')) {
    submitted = await submitToLocalServer(entries);
  }

  if (!submitted && (SUBMIT_MODE === 'download' || SUBMIT_MODE === 'auto')) {
    downloadEntriesCsv(entries);
    submitted = true;
    showToast(
      `Saved ${entries.length} activit${entries.length === 1 ? 'y' : 'ies'} as CSV download. Email the file to your admin.`,
      'success'
    );
  }

  submitBtn.textContent = 'Submit All Activities';
  submitBtn.disabled = false;

  if (submitted) {
    sessionLog = [];
    updateSessionUI();
  } else {
    showToast('Could not submit. Check Power Automate URL in js/config.js or start the local server.', 'error');
  }
}

async function submitToPowerAutomate(entries) {
  if (!POWER_AUTOMATE_URL) return false;

  let successCount = 0;

  for (const entry of entries) {
    const headers = { 'Content-Type': 'application/json' };
    if (POWER_AUTOMATE_KEY) headers['X-JIJ-Key'] = POWER_AUTOMATE_KEY;

    try {
      await fetch(POWER_AUTOMATE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(entry),
        mode: 'no-cors',
      });
      successCount++;
    } catch {
      return false;
    }
  }

  if (successCount === entries.length) {
    showToast(
      `🎉 ${successCount} activit${successCount === 1 ? 'y' : 'ies'} submitted to OneDrive / SharePoint!`,
      'success'
    );
    return true;
  }
  return false;
}

async function submitToLocalServer(entries) {
  try {
    const res = await fetch(LOCAL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.ok) {
      showToast(
        `🎉 ${data.count} activit${data.count === 1 ? 'y' : 'ies'} saved to server!`,
        'success'
      );
      return true;
    }
  } catch {
    /* local server not running */
  }
  return false;
}

function downloadEntriesCsv(entries) {
  const headers = ['Timestamp', 'Team', 'Member', 'Activity', 'TimeValue', 'Points'];
  const escape = (v) => {
    const s = String(v ?? '');
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = [
    headers.join(','),
    ...entries.map((e) => headers.map((h) => escape(e[h])).join(',')),
  ];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `jij-2026-submission-${stamp}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* Hero stat animation on scroll */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
