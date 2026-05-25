const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
};

const server = http.createServer((req, res) => {
  console.log(`[REQUEST] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  let urlPath = req.url === '/' ? '/index.html' : req.url;
  // Strip query strings
  urlPath = urlPath.split('?')[0];

  const filePath = path.join(ROOT, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404); res.end('404 Not Found');
      } else {
        res.writeHead(500); res.end('500 Server Error');
      }
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   🌆  GEOMETRIC CITY  — LIVE         ║');
  console.log('  ║                                      ║');
  console.log(`  ║   http://localhost:${PORT}              ║`);
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
  console.log('  Scroll to journey through the city.');
  console.log('  Press Ctrl+C to stop the server.\n');
});
