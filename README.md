# Jacked in June 2026

IMW Iron Man fitness challenge activity tracker.

## Live Site

https://garyghagimw.github.io/JackedinJune/

## Submissions → OneDrive / SharePoint

The site submits entries via **Power Automate** to a file on your OneDrive or a SharePoint list.

**Setup guide:** [docs/microsoft-setup.md](docs/microsoft-setup.md)

Quick steps:
1. Create `jij-2026-submissions.xlsx` in OneDrive with a table named `Submissions`
2. Create a Power Automate flow (HTTP trigger → Add row to Excel table)
3. Paste the HTTP POST URL into `js/config.js`
4. Push to GitHub

### Fallback options

| Mode | When to use |
|------|-------------|
| `powerautomate` | Production — writes to OneDrive/SharePoint |
| `auto` | Tries Power Automate, then local server, then CSV download |
| `local` | `start-server.bat` → saves to `data/jij-2026-submissions.csv` on your PC |
| `download` | Browser downloads CSV (no backend needed) |

## Project Structure

```
JIJ 2026/
├── index.html
├── js/config.js            ← Power Automate URL goes here
├── js/activities.js
├── js/app.js
├── server/server.js        ← optional local fallback
├── start-server.bat
├── docs/microsoft-setup.md ← OneDrive / SharePoint setup
└── data/                   ← local CSV (gitignored)
```

## Local Development

```bash
node server/server.js
# → http://localhost:3000
```

## Deployment

```bash
git push origin main
```

GitHub Pages deploys from `main` automatically.
