# Power BI Leaderboard

## Current setup

The site embeds your Power BI share link in the Leaderboard section.

**Open in browser:** [Power BI report](https://app.powerbi.com/links/uXRibvAYus?ctid=ce489f49-6a08-487c-bc9c-7d75078824ea&pbi_source=linkShare)

## If embed does not load for colleagues

Share links often require **IMW sign-in** when embedded on github.io (same class of issue as Excel).

For a **public** embed that works for everyone without login:

1. Open the report in **Power BI Service**
2. **File → Embed report → Publish to web**
3. Copy the embed URL (starts with `https://app.powerbi.com/view?r=`)
4. Replace `POWER_BI_EMBED_URL` in `js/config.js`
5. Push to GitHub

> Publish to web makes the report publicly viewable. Confirm with IT that this is acceptable for JIJ data.

## Data refresh

Power BI updates when the **dataset refreshes** (scheduled refresh in Power BI settings). Submissions still flow via Power Automate into Excel; connect PBI to that Excel file or dataset.

No second Power Automate flow is needed for the website when PBI embed works.
