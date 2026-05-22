# Jacked in June 2026

IMW Iron Man fitness challenge activity tracker — a GitHub Pages site for logging workouts and earning points.

## Live Site

https://garyghagimw.github.io/JackedinJune/

## Project Structure

```
JIJ 2026/
├── index.html              # Main tracking page
├── css/styles.css          # Site styles
├── js/
│   ├── activities.js       # Activity definitions, teams, submit config
│   └── app.js              # Tracker UI & submission logic
├── server/server.js        # Local server — writes submissions to CSV
├── start-server.bat        # Double-click to start local server
├── data/                   # Submission CSV stored here (gitignored)
├── assets/images/          # Web-optimized images
└── README.md
```

## How Submissions Work

GitHub Pages is a **static** site — it cannot write files to your PC or to git by itself.

Two options are built in:

### Option 1 — Local server on your PC (recommended for admin)

1. Double-click **`start-server.bat`** (or run `node server/server.js`)
2. Open **http://localhost:3000**
3. Submissions append to **`data/jij-2026-submissions.csv`**
4. Open that file in Excel anytime (Save As `.xlsx` if you prefer)

Keep the server window open while collecting entries. For colleagues on your office network, share your PC's IP instead of localhost (e.g. `http://192.168.1.50:3000`).

### Option 2 — CSV download (works from GitHub Pages)

When someone submits from the public GitHub Pages URL and the local server isn't reachable, the browser **downloads a CSV file** automatically. They can email it to you or drop it in the `data/` folder.

To force download-only mode, set `SUBMIT_MODE = 'download'` in `js/activities.js`.

> **Note:** Submission data is gitignored and not pushed to GitHub (participant privacy).

## Features

- Interactive activity tracker with live point calculation
- 13 activities with official point values
- Walking supports duration OR step count (4,000 steps = 5 pts)
- Session log — add multiple activities before submitting
- Local CSV storage or browser CSV download
- Responsive, modern glass-morphism UI

## Local Development

```bash
node server/server.js
```

Then visit http://localhost:3000

## Deployment

Site is deployed via GitHub Pages from the `main` branch root.

```bash
git add .
git commit -m "Update site"
git push origin main
```

## Activity Points

| Activity | Points |
|----------|--------|
| Walking (1 hr OR 4,000 steps) | 5 |
| Running | 10/hr |
| Biking | 8/hr |
| Swimming | 10/hr |
| Strength Training | 8/hr |
| Yoga / Stretching | 5/hr |
| Dancing | 6/hr |
| Fitness Class | 8/hr |
| Squash | 9/hr |
| Tennis | 8/hr |
| Basketball | 9/hr |
| Golf (Walking) | 6/hr |
| Stationary Bike | 7/hr |

## Other Backend Options

If you need company-wide submissions without running a PC server:

- **Microsoft SharePoint List** — fits IMW's existing SharePoint setup
- **Microsoft Forms** — simple, no code, exports to Excel
- **Formspree / similar** — third-party form API (free tier available)
