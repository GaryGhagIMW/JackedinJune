# Embed Charts from OneDrive Excel

Instead of a custom dashboard, the site embeds your **Excel Online** charts directly. When submissions arrive via Power Automate, pivot charts in the file update automatically.

## Step 1 — Create charts in Excel

1. Open `jij-2026-submissions.xlsx` in **Excel Online** (browser)
2. Add a new sheet named **`Dashboard`**
3. Create **PivotTables** from the `Submissions` table:
   - **By Team:** Rows = Team, Values = Sum of Points
   - **By Member:** Rows = Member, Values = Sum of Points
   - **By Activity:** Rows = Activity, Values = Sum of Points
4. Insert **charts** from each pivot (bar, column, or pie)
5. Arrange charts on the Dashboard sheet
6. Save

> Pivot charts refresh when the underlying `Submissions` table gets new rows from Power Automate.

## Step 2 — Get the embed URL

1. In Excel Online, go to **File → Share → Embed this workbook**
   - Or: **Share** button → **Embed** tab
2. Choose options:
   - What to show: **Entire workbook** or the **Dashboard** sheet only (if available)
   - Uncheck "Let people sort and filter" if you want view-only
3. Copy the **iframe src URL** (starts with `https://` and contains `embed`)

Example format:
```
https://imwca-my.sharepoint.com/personal/.../embed?...
```

4. Sharing must allow viewers to see the file:
   - **People in IMW Industries Ltd** with link, or
   - **Anyone with the link** (if you want no login prompt)

## Step 3 — Connect the website

Edit `js/config.js`:

```javascript
const EXCEL_EMBED_URL = 'https://imwca-my.sharepoint.com/.../embed?...';
```

Push to GitHub. The Leaderboard section will show your live Excel charts.

## Tradeoffs

| Excel embed | Custom Chart.js dashboard |
|-------------|---------------------------|
| Charts you design in Excel | Charts coded in the site |
| No second Power Automate flow | Needed a read-data flow |
| May prompt IMW login for some users | Fully public |
| Live data via pivot refresh | Pulled JSON on a timer |

## Tips

- Put all charts on one **Dashboard** sheet for a clean embed
- After submitting a test entry, refresh the page to reload the embed
- If embed shows "sign in", adjust sharing on the Excel file to your org or anyone with link
