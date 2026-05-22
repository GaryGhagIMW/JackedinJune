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
const POWER_AUTOMATE_URL = '';

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
