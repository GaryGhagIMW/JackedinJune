# Microsoft 365 Setup — OneDrive Excel or SharePoint List

The Jacked in June site is static (GitHub Pages). It cannot write to OneDrive directly. Instead, it POSTs to a **Power Automate** flow that you create in your IMW Microsoft 365 account. The flow writes each submission to a file on your OneDrive or to a SharePoint list.

**Time to set up:** ~15 minutes  
**Requires:** Microsoft 365 with Power Automate (included in most business plans)

---

## Overview

```
GitHub Pages site  →  Power Automate (HTTP trigger)  →  OneDrive Excel  OR  SharePoint List
```

After setup, paste the HTTP trigger URL into `js/config.js` and push to GitHub.

---

## Step 1 — Create the destination file

### Option A — OneDrive Excel file (recommended)

1. Open **OneDrive** (https://onedrive.com or via File Explorer → OneDrive).
2. Create a folder: `Jacked in June 2026`
3. Create a new Excel workbook: `jij-2026-submissions.xlsx`
4. In row 1, add these column headers:

   | Timestamp | Team | Member | Activity | DurationMinutes | Steps | Points |
   |-----------|------|--------|----------|-----------------|-------|--------|

   - **DurationMinutes** — time-based entries (running, biking, walking by time, etc.)
   - **Steps** — walking entries logged by step count instead of minutes
   - Only one is filled per row; the other stays blank

5. Select the header row + one empty row below → **Insert → Table** → check "My table has headers"
6. Name the table **`Submissions`** (Table Design → Table Name)
7. Save — the file stays in your OneDrive

> You can also upload `docs/jij-2026-submissions-template.csv` to OneDrive, open in Excel Online, and convert to a table.

### How steps vs. time appear in Excel

Walking is the only activity that accepts **either** minutes **or** steps. Every other activity uses minutes only.

| What the user enters | DurationMinutes | Steps | Points (example) |
|----------------------|-----------------|-------|------------------|
| 45 min running | `45` | *(blank)* | 7.5 |
| 60 min walking | `60` | *(blank)* | 5 |
| 8,000 steps walking | *(blank)* | `8000` | 10 |
| 30 min swimming | `30` | *(blank)* | 5 |

In Excel you can:
- **Filter** the `Steps` column → "is not blank" to see all step-based walking entries
- **Sum** `Steps` by Member (pivot table) for total steps per person
- **Sum** `DurationMinutes` for total active minutes on time-based activities
- **Sum** `Points` for leaderboard totals

If someone enters both minutes and steps for walking, both columns are saved; points use whichever method scores higher (4,000 steps = 1 hour walking = 5 pts).

### Option B — SharePoint List

1. Go to your SharePoint site (e.g. https://imwca.sharepoint.com)
2. **New → List → Blank list**
3. Name: `JIJ 2026 Submissions`
4. Add columns (Single line of text unless noted):

   | Column name | Type |
   |-------------|------|
   | Timestamp   | Single line of text |
   | Team        | Single line of text |
   | Member      | Single line of text |
   | Activity          | Single line of text |
   | DurationMinutes   | Number (blank if logged by steps) |
   | Steps             | Number (blank if logged by time) |
   | Points            | Number |

---

## Step 2 — Create the Power Automate flow

1. Go to **https://make.powerautomate.com**
2. **Create → Instant cloud flow**
3. Name: `JIJ 2026 - Save Submission`
4. Trigger: **When a HTTP request is received**
5. Click **Generate from sample** and paste this JSON schema:

```json
{
  "type": "object",
  "properties": {
    "Timestamp": { "type": "string" },
    "Team": { "type": "string" },
    "Member": { "type": "string" },
    "Activity": { "type": "string" },
    "DurationMinutes": { "type": "string" },
    "Steps": { "type": "string" },
    "Points": { "type": "string" }
  }
}
```

6. Click **+ New step**

### For OneDrive Excel (Option A)

Add action: **Excel Online (Business) → Add a row into a table**

| Setting | Value |
|---------|-------|
| Location | OneDrive for Business |
| Document Library | OneDrive |
| File | `/Jacked in June 2026/jij-2026-submissions.xlsx` |
| Table | `Submissions` |

Map dynamic content from the HTTP trigger:

| Column | Dynamic value |
|--------|---------------|
| Timestamp | Timestamp |
| Team | Team |
| Member | Member |
| Activity | Activity |
| DurationMinutes | DurationMinutes |
| Steps | Steps |
| Points | Points |

### For SharePoint List (Option B)

Add action: **SharePoint → Create item**

| Setting | Value |
|---------|-------|
| Site Address | Your SharePoint site URL |
| List Name | `JIJ 2026 Submissions` |

Map the same fields from the HTTP trigger dynamic content.

### Optional — shared secret (recommended)

Before the Excel/SharePoint action, add:

1. **+ New step → Condition**
2. Condition: `triggerOutputs()?['headers']?['X-JIJ-Key']` is equal to `your-secret-here`
3. Put the Excel/SharePoint action in **If yes**
4. In **If no**, add **Response** action with status code `403`
5. Set the same secret in `js/config.js` → `POWER_AUTOMATE_KEY`

7. **Save** the flow

---

## Step 3 — Copy the HTTP POST URL

1. Open your flow in Power Automate
2. Expand the **When a HTTP request is received** trigger
3. Copy the **HTTP POST URL** (long URL ending in `.../invoke?api-version=...`)

---

## Step 4 — Connect the website

Edit `js/config.js`:

```javascript
const POWER_AUTOMATE_URL = 'https://prod-XX....logic.azure.com/workflows/.../triggers/manual/paths/invoke?...';
const POWER_AUTOMATE_KEY = 'your-secret-here';  // optional, must match flow condition
const SUBMIT_MODE = 'powerautomate';            // or 'auto' to keep local/CSV fallbacks
```

Commit and push:

```bash
git add js/config.js
git commit -m "Connect Power Automate submission endpoint"
git push origin main
```

---

## Step 5 — Test

1. Open https://garyghagimw.github.io/JackedinJune/ (or http://localhost:3000)
2. Log a test activity and submit
3. Check your OneDrive Excel file or SharePoint list for the new row
4. In Power Automate → **Run history** to confirm the flow ran

> Submissions use `mode: 'no-cors'` (same technique as the old Google Apps Script form). The browser cannot show flow errors — check Power Automate run history if rows don't appear.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| No rows in Excel | Check Power Automate run history for errors; verify table name is `Submissions` |
| Flow never triggers | Confirm URL in `js/config.js` matches the trigger URL exactly |
| 403 in run history | `POWER_AUTOMATE_KEY` doesn't match the flow condition |
| CORS errors in console | Expected with `no-cors` — ignore if run history shows success |
| Wrong OneDrive file | Re-select file path in the Excel Online action |

---

## Microsoft Forms (alternative)

If you prefer zero-code and don't need the custom site UI:

1. Create a **Microsoft Form** with Team, Name, Activity, Duration, Points fields
2. In Forms → **Responses → Open in Excel** — creates a live-linked Excel file in OneDrive automatically
3. Share the Form link instead of (or alongside) the custom tracker

The custom site gives a better UX; Microsoft Forms is simpler to maintain.

---

## Security note

The Power Automate HTTP POST URL acts like a password — anyone with the URL can submit data. For a company fitness event this is usually fine. Use the optional `X-JIJ-Key` header for basic protection, or restrict knowledge of the site URL to staff only.

Do **not** commit real participant data to the public GitHub repo — only the flow URL and site code.
