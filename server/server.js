/**
 * Jacked in June 2026 — local submission server
 *
 * Serves the static site and appends form entries to a CSV file on this PC.
 * CSV opens directly in Excel; save as .xlsx if you prefer that format.
 *
 * Usage:  node server/server.js
 *         (or double-click start-server.bat)
 *
 * Site:   http://localhost:3000
 * Data:   data/jij-2026-submissions.csv
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const CSV_FILE = path.join(DATA_DIR, 'jij-2026-submissions.csv');

const HEADERS = ['Timestamp', 'Team', 'Member', 'Activity', 'DurationMinutes', 'Steps', 'Points'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.md': 'text/markdown; charset=utf-8',
};

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, HEADERS.join(',') + '\n', 'utf8');
  }
}

function escapeCsv(value) {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function appendRows(entries) {
  ensureDataFile();
  const lines = entries.map((e) =>
    HEADERS.map((h) => escapeCsv(e[h])).join(',')
  );
  fs.appendFileSync(CSV_FILE, lines.join('\n') + '\n', 'utf8');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (url.pathname === '/api/submit' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const entries = Array.isArray(body.entries) ? body.entries : [body];
      if (!entries.length) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'No entries provided' }));
        return;
      }
      appendRows(entries);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, count: entries.length, file: CSV_FILE }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  if (url.pathname === '/api/status' && req.method === 'GET') {
    ensureDataFile();
    const stat = fs.statSync(CSV_FILE);
    const lines = fs.readFileSync(CSV_FILE, 'utf8').trim().split('\n');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: true,
        file: CSV_FILE,
        submissions: Math.max(0, lines.length - 1),
        lastModified: stat.mtime,
      })
    );
    return;
  }

  let filePath = path.join(ROOT, decodeURIComponent(url.pathname));
  if (url.pathname === '/') filePath = path.join(ROOT, 'index.html');

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    serveStatic(filePath, res);
  });
});

ensureDataFile();
server.listen(PORT, () => {
  console.log('');
  console.log('  Jacked in June 2026 — local server running');
  console.log('  -------------------------------------------');
  console.log(`  Website:     http://localhost:${PORT}`);
  console.log(`  Submissions: ${CSV_FILE}`);
  console.log('');
  console.log('  Keep this window open while collecting entries.');
  console.log('  Open the CSV in Excel anytime to review submissions.');
  console.log('');
});
