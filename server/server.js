/**
 * Jacked in June 2026 — local submission server
 *
 * Serves the static site and writes submissions directly to your OneDrive Excel file.
 *
 * Usage:  node server/server.js  (or double-click start-server.bat)
 * Site:   http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { execFile } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');
const PS_SCRIPT = path.join(__dirname, 'append-onedrive.ps1');

// Read Power Automate URL from config.js (simple parse, no eval)
function readPowerAutomateUrl() {
  try {
    const config = fs.readFileSync(path.join(ROOT, 'js', 'config.js'), 'utf8');
    const match = config.match(/const POWER_AUTOMATE_URL\s*=\s*['"]([^'"]+)['"]/);
    return match ? match[1] : '';
  } catch {
    return '';
  }
}

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

function appendToOneDrive(entries) {
  return new Promise((resolve, reject) => {
    execFile(
      'powershell.exe',
      [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        PS_SCRIPT,
        '-EntriesJson',
        JSON.stringify(entries),
      ],
      { maxBuffer: 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        try {
          resolve(JSON.parse(stdout.trim()));
        } catch {
          reject(new Error(stdout || 'Unknown PowerShell error'));
        }
      }
    );
  });
}

async function proxyToPowerAutomate(entry) {
  const url = readPowerAutomateUrl();
  if (!url) throw new Error('POWER_AUTOMATE_URL not configured');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Power Automate ${res.status}: ${text}`);
  }
  return { status: res.status, body: text };
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

      const result = await appendToOneDrive(entries);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  if (url.pathname === '/api/test-powerautomate' && req.method === 'POST') {
    try {
      const entry = await readBody(req);
      const result = await proxyToPowerAutomate(entry);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, ...result }));
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
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

server.listen(PORT, () => {
  console.log('');
  console.log('  Jacked in June 2026 — local server running');
  console.log('  -------------------------------------------');
  console.log(`  Website:     http://localhost:${PORT}`);
  console.log('  Submissions: OneDrive Excel (jij-2026-submissions.xlsx)');
  console.log('');
  console.log('  Close Excel before submitting if rows fail to append.');
  console.log('');
});
