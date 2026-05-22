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
│   ├── activities.js       # Activity definitions & point calculations
│   └── app.js              # Tracker UI & form submission
├── assets/images/          # Web-optimized images
├── site assets/images/     # Original source assets
├── .cursor/rules/          # Cursor project rules
└── README.md
```

## Features

- Interactive activity tracker with live point calculation
- 13 activities with official point values
- Walking supports duration OR step count (4,000 steps = 5 pts)
- Session log — add multiple activities before submitting
- Submissions sent to existing Google Sheets backend
- Responsive, modern glass-morphism UI

## Local Development

Open `index.html` in a browser, or serve locally:

```bash
npx serve .
```

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
