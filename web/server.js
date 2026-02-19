const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { spawn } = require('child_process');

const port = 8080;
const base = __dirname;
const devBuildId = '20260215b';

function loadEnvFile() {
  const envPath = path.join(base, '.env');
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^"|"$/g, '');
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

loadEnvFile();

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/tts')) {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) req.destroy();
    });
    req.on('end', () => {
      let payload = null;
      try {
        payload = JSON.parse(body || '{}');
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      const provider = String(payload.provider || 'openai').toLowerCase();
      if (provider !== 'openai') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unsupported TTS provider' }));
        return;
      }

      const apiKey = process.env.OPENAI_API_KEY || '';
      if (!apiKey) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'OPENAI_API_KEY missing' }));
        return;
      }

      const text = String(payload.text || '').trim();
      if (!text) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Text is required' }));
        return;
      }

      const ttsPayload = JSON.stringify({
        model: String(payload.model || 'gpt-4o-mini-tts'),
        voice: String(payload.voiceId || 'nova'),
        input: text,
        response_format: 'mp3'
      });

      const ttsReq = https.request(
        {
          method: 'POST',
          hostname: 'api.openai.com',
          path: '/v1/audio/speech',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(ttsPayload)
          }
        },
        (ttsRes) => {
          const contentType = ttsRes.headers['content-type'] || 'audio/mpeg';
          res.writeHead(ttsRes.statusCode || 500, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
          });
          ttsRes.pipe(res);
        }
      );

      ttsReq.on('error', () => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'TTS request failed' }));
      });

      ttsReq.write(ttsPayload);
      ttsReq.end();
    });
    return;
  }

  if (req.url.startsWith('/proxy')) {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const target = requestUrl.searchParams.get('url');

    if (!target) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing url');
      return;
    }

    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid url');
      return;
    }

    const allowedHosts = ['mdc.mo.gov', 'www.mdc.mo.gov'];
    if (!allowedHosts.includes(targetUrl.hostname)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Host not allowed');
      return;
    }

    https.get(targetUrl, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, {
        'Content-Type': proxyRes.headers['content-type'] || 'text/plain',
        'Access-Control-Allow-Origin': '*'
      });
      proxyRes.pipe(res);
    }).on('error', () => {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Proxy request failed');
    });
    return;
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const requestPath = decodeURIComponent(requestUrl.pathname || '/');
  let filePath = path.join(base, requestPath === '/' ? 'index.html' : requestPath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    // Dev server: ensure changes reflect immediately on PC + phone.
    // Some browsers will otherwise cache JS/CSS aggressively when no headers are set.
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'text/plain',
      'Cache-Control': 'no-store, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Huntech-Build': devBuildId,
    });
    res.end(data);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}/`);
  console.log(`Server running at http://0.0.0.0:${port}/ (LAN)`);

  // Fire-and-forget local backup runner (chat logs + project files).
  try {
    const child = spawn(process.execPath, [path.join(__dirname, 'auto-chatlog-backup.js')], {
      stdio: 'ignore',
      detached: true,
      windowsHide: true
    });
    child.unref();
  } catch (error) {
    // Best-effort; server should still run.
  }
});
