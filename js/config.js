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

/** Power BI report — embed on site (share link or Publish to web URL) */
const POWER_BI_EMBED_URL =
  'https://app.powerbi.com/links/uXRibvAYus?ctid=ce489f49-6a08-487c-bc9c-7d75078824ea&pbi_source=linkShare';

/** Fallback: Power Automate GET URL for built-in charts if PBI embed is unavailable */
const DASHBOARD_URL = '';

/** Open full Excel file in browser (IMW login required) */
const EXCEL_VIEW_URL =
  'https://imwca-my.sharepoint.com/personal/gary_ghag_imw_ca/_layouts/15/Doc.aspx?sourcedoc={b7792ec9-e2f3-4a0b-8310-3a527001870c}&action=default';

window.POWER_BI_EMBED_URL = POWER_BI_EMBED_URL;
window.DASHBOARD_URL = DASHBOARD_URL;
window.EXCEL_VIEW_URL = EXCEL_VIEW_URL;
window.POWER_AUTOMATE_URL = POWER_AUTOMATE_URL;
window.POWER_AUTOMATE_KEY = POWER_AUTOMATE_KEY;
window.SUBMIT_MODE = SUBMIT_MODE;
window.LOCAL_API = LOCAL_API;
