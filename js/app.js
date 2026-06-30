let sessionLog = [];
let selectedActivityId = 'running';

function isEntryLocked() {
  const cutoff = window.ENTRY_CUTOFF_ISO;
  if (!cutoff) return false;
  return Date.now() >= new Date(cutoff).getTime();
}

function applyEntryLockdown() {
  if (!isEntryLocked()) return;

  document.querySelector('.tracker-panel')?.classList.add('tracker-locked');
  document.getElementById('entry-lock-banner')?.classList.remove('hidden');

  ['team', 'member', 'minutes', 'steps'].forEach((id) => {
    document.getElementById(id)?.setAttribute('disabled', 'disabled');
  });

  document.getElementById('add-activity')?.setAttribute('disabled', 'disabled');
  document.getElementById('submit-all')?.setAttribute('disabled', 'disabled');
  document.getElementById('clear-session')?.setAttribute('disabled', 'disabled');

  document.querySelectorAll('#activity-grid .activity-card').forEach((btn) => {
    btn.disabled = true;
  });

  const heroCta = document.querySelector('.hero-cta');
  if (heroCta) {
    heroCta.textContent = 'View Leaderboard →';
    heroCta.href = '#dashboard';
  }

  const trackIntro = document.querySelector('#track .section-header p');
  if (trackIntro) {
    trackIntro.textContent =
      'The entry period has ended. View final standings on the leaderboard below.';
  }

  const notice = document.querySelector('.notice-banner');
  if (notice) {
    notice.textContent = 'Submissions are closed. The leaderboard reflects all entries received before the cutoff.';
  }

  updateSessionUI();
}

document.addEventListener('DOMContentLoaded', () => {
  renderActivityCards();
  populateTeams();
  bindEvents();
  applyEntryLockdown();
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

  teamSelect.innerHTML =
    '<option value="" selected disabled>— Select team —</option>' +
    Object.entries(TEAMS)
      .map(([id, team]) => `<option value="${id}">${team.name}</option>`)
      .join('');

  teamSelect.addEventListener('change', updateMembers);
  updateMembers();
}

function updateMembers() {
  const teamId = document.getElementById('team')?.value;
  const memberSelect = document.getElementById('member');
  if (!memberSelect) return;

  if (!teamId) {
    memberSelect.innerHTML = '<option value="" selected disabled>— Select your name —</option>';
    memberSelect.disabled = true;
    return;
  }

  memberSelect.disabled = false;
  const members = TEAMS[teamId]?.members ?? [];

  memberSelect.innerHTML =
    '<option value="" selected disabled>— Select your name —</option>' +
    members.map((m) => `<option value="${m}">${m}</option>`).join('');
}

function getTeamMemberSelection() {
  const team = document.getElementById('team')?.value ?? '';
  const member = document.getElementById('member')?.value ?? '';
  return { team, member, isValid: Boolean(team && member) };
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
    if (isEntryLocked()) {
      showToast('Entries are closed — cutoff was July 2, 2026 at 10:00 AM PDT.', 'error');
      return;
    }
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
  if (isEntryLocked()) {
    showToast('Entries are closed — cutoff was July 2, 2026 at 10:00 AM PDT.', 'error');
    return;
  }

  const { team, member, isValid } = getTeamMemberSelection();
  const activity = getActivityById(selectedActivityId);
  const { minutes, steps } = getInputValues();
  const points = calculatePoints(selectedActivityId, minutes, steps);

  if (!isValid) {
    showToast('Please choose your team and member before adding an activity.', 'error');
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

  if (submitBtn) submitBtn.disabled = sessionLog.length === 0 || isEntryLocked();
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
  if (isEntryLocked()) {
    showToast('Entries are closed — cutoff was July 2, 2026 at 10:00 AM PDT.', 'error');
    return;
  }

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
    DurationMinutes: entry.minutes > 0 ? String(entry.minutes) : '',
    Steps: entry.steps > 0 ? String(entry.steps) : '',
    Points: String(entry.points),
  }));

  let submitted = false;

  // Power Automate — works for all users via GitHub Pages
  if (SUBMIT_MODE === 'powerautomate' || SUBMIT_MODE === 'auto') {
    submitted = await submitToPowerAutomate(entries);
  }

  // Local server fallback (when start-server.bat is running on this PC)
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
  submitBtn.disabled = sessionLog.length === 0 || isEntryLocked();

  if (submitted) {
    sessionLog = [];
    updateSessionUI();
    window.dispatchEvent(new CustomEvent('jij:submitted'));
  } else {
    showToast('Could not submit. Check your connection and try again.', 'error');
  }
}

async function submitToLocalServer(entries) {
  try {
    const res = await fetch(LOCAL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      showToast(
        `🎉 ${data.count} activit${data.count === 1 ? 'y' : 'ies'} saved to OneDrive Excel!`,
        'success'
      );
      return true;
    }
    if (!res.ok && data.error) {
      showToast(`Submit failed: ${data.error}`, 'error');
    }
  } catch {
    /* local server not running */
  }
  return false;
}

async function submitToPowerAutomate(entries) {
  if (!POWER_AUTOMATE_URL || !POWER_AUTOMATE_URL.includes('sig=')) return false;

  let successCount = 0;

  for (const entry of entries) {
    const headers = { 'Content-Type': 'application/json' };
    if (POWER_AUTOMATE_KEY) headers['X-JIJ-Key'] = POWER_AUTOMATE_KEY;

    try {
      const res = await fetch(POWER_AUTOMATE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(entry),
      });

      if (res.ok || res.status === 202) {
        successCount++;
      } else {
        showToast(`Submit failed (${res.status}). Check Power Automate run history.`, 'error');
        return false;
      }
    } catch (err) {
      showToast(`Submit failed: ${err.message}`, 'error');
      return false;
    }
  }

  if (successCount === entries.length) {
    showToast(
      `🎉 ${successCount} activit${successCount === 1 ? 'y' : 'ies'} submitted!`,
      'success'
    );
    return true;
  }
  return false;
}

function downloadEntriesCsv(entries) {
  const headers = ['Timestamp', 'Team', 'Member', 'Activity', 'DurationMinutes', 'Steps', 'Points'];
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
