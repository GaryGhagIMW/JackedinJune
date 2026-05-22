# Live Dashboard Setup

The leaderboard at the bottom of the site reads submission data from your OneDrive Excel file.

## For GitHub Pages (production)

Create a **second Power Automate flow** to read the Excel table and return JSON.

### Steps

1. **Create → Instant cloud flow** — name: `JIJ 2026 - Read Submissions`
2. Trigger: **When a HTTP request is received** (no JSON schema needed)
3. Set trigger authentication to **Anyone**
4. Add action: **Excel Online (Business) → List rows present in a table**
   - File: `Jacked in June 2026/jij-2026-submissions.xlsx`
   - Table: `Submissions`
5. Add action: **Response**
   - Status code: `200`
   - Headers: `Content-Type` = `application/json`
   - Body:
   ```json
   {
     "ok": true,
     "rows": @{body('List_rows_present_in_a_table')?['value']}
   ```
   (Use dynamic content picker for the `rows` value)
6. **Save** → copy the **HTTP GET URL** from the trigger
7. Paste into `js/config.js` → `DASHBOARD_URL`
8. Push to GitHub

The dashboard auto-refreshes every 60 seconds and after each submission.

## For local testing

Run `start-server.bat` — the dashboard reads from `/api/dashboard` automatically (no second flow needed).

## What the dashboard shows

- **KPIs:** Total points, activities logged, active members, top activity
- **Charts:** Points by team, top members, points by activity
- **Leaderboards:** Team and member standings
