# Leaderboard Read Flow (required for all users)

## Why the Excel embed failed

Embedding your OneDrive file on **github.io** only works for you (the file owner). Microsoft blocks the iframe for everyone else with **"refused to connect"** — this is normal IMW/SharePoint security.

The site now uses **public charts** that load data through a second Power Automate flow (no login required for viewers).

---

## Create the read flow (~10 minutes)

1. Go to **https://make.powerautomate.com**
2. **Create → Instant cloud flow** — name: `JIJ 2026 - Read Submissions`
3. Trigger: **When a HTTP request is received**
   - Method: **GET** (or Any)
   - Authentication: **Anyone**
4. **+ New step:** **Excel Online (Business) → List rows present in a table**
   - File: `Jacked in June 2026/jij-2026-submissions.xlsx`
   - Table: `Submissions`
5. **+ New step:** **Response**
   - Status code: `200`
   - Headers: `Content-Type` = `application/json`
   - Body (switch to expression mode `fx`):

```
{
  "ok": true,
  "rows": @{body('List_rows_present_in_a_table')?['value']}
}
```

Replace `List_rows_present_in_a_table` with the actual name of your List rows action if different.

6. **Save** the flow
7. Open the trigger → copy the **HTTP GET URL** (must include `sig=`)

## Connect the website

Edit `js/config.js`:

```javascript
const DASHBOARD_URL = 'https://...your GET URL with sig=...';
```

Push to GitHub. The leaderboard will work for **everyone** without Microsoft login.

## Test

Open: https://garyghagimw.github.io/JackedinJune/#dashboard

You should see team/member charts and KPIs within a few seconds.
