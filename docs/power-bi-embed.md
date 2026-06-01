# Power BI Leaderboard

## Current setup

The site uses **Embed for your organization**:

`reportEmbed?reportId=2d678484-02d9-4d57-ba4b-6f11f0d496d2&autoAuth=true`

Viewers must use an **IMW work account** that has access to the report workspace. `autoAuth=true` uses their existing Microsoft 365 browser sign-in when possible.

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
