/**
 * Jacked in June 2026 — backend configuration
 *
 * SETUP: See docs/microsoft-setup.md
 *
 * 1. Create a Power Automate flow (HTTP trigger → OneDrive Excel or SharePoint List)
 * 2. Paste your HTTP POST URL below
 * 3. Set SUBMIT_MODE to 'auto' or 'powerautomate'
 */

/** Power Automate HTTP trigger URL (from flow trigger → HTTP POST URL) */
const POWER_AUTOMATE_URL =
  'https://defaultce489f496a08487cbc9c7d75078824.ea.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/af77d0edadc4474b9ec573429e61e93b/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=d2g2SfJGCRBcmpm-bM7JKbPu12TmGHeyjchrjX40qTg';

/** Optional shared secret — set the same value in your Power Automate flow condition */
const POWER_AUTOMATE_KEY = '';

/**
 * Submission mode
 *
 * auto           — Power Automate → local server → CSV download
 * powerautomate  — Power Automate only
 * local          — local server only (start-server.bat)
 * download       — CSV download only
 */
const SUBMIT_MODE = 'auto';

/** Local API when running start-server.bat */
const LOCAL_API = '/api/submit';

/**
 * Dashboard read URL — optional Power Automate flow that returns Excel rows as JSON.
 * See docs/dashboard-setup.md. Falls back to /api/dashboard when using start-server.bat.
 */
const DASHBOARD_URL = '';
