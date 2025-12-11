/*
 Simple pRPC proxy server
 - Accepts JSON-RPC POST bodies and forwards them to public pRPC hosts
 - Tries the primary host (from PRPC_PRIMARY env) then falls back through PRPC_HOSTS
 - 5s timeout per host
 - In-memory cache for `getGossipNodes` (60s)
 - Listens on PORT (default 80)
*/

const express = require('express');
const fetch = require('node-fetch');
const morgan = require('morgan');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

const DEFAULT_HOSTS = [
  'http://173.212.203.145:8899',
  'http://173.212.220.65:8899',
  'http://161.97.97.41:8899',
  'http://192.190.136.36:8899',
  'http://192.190.136.37:8899',
  'http://192.190.136.38:8899',
  'http://192.190.136.28:8899',
  'http://192.190.136.29:8899',
  'http://207.244.255.1:8899'
];

const PRIMARY = process.env.PRIMARY_PRPC || process.env.NEXT_PUBLIC_PRPC_ENDPOINT;
const HOSTS = PRIMARY ? [PRIMARY].concat(DEFAULT_HOSTS) : DEFAULT_HOSTS;

const TIMEOUT_MS = Number(process.env.PRPC_TIMEOUT_MS || 5000);
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 60000);
const PROXY_API_KEY = process.env.PROXY_API_KEY || '';

// Simple in-memory cache
const cache = new Map();
function getCache(key) {
  const v = cache.get(key);
  if (!v) return null;
  if (Date.now() > v.expires) {
    cache.delete(key);
    return null;
  }
  return v.value;
}
function setCache(key, value, ttl = CACHE_TTL_MS) {
  cache.set(key, { value, expires: Date.now() + ttl });
}

async function fetchWithTimeout(url, options = {}, timeout = TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', hosts: HOSTS.length });
});

app.post('/', async (req, res) => {
  // Accept JSON-RPC body
  const body = req.body;
  if (!body || !body.method) {
    return res.status(400).json({ ok: false, error: 'Invalid JSON-RPC body' });
  }

  // Simple API key check (if configured)
  if (PROXY_API_KEY) {
    const key = (req.headers['x-api-key'] || req.headers['X-API-KEY'] || req.headers['x-api_key']);
    if (!key || String(key) !== PROXY_API_KEY) {
      console.warn('Unauthorized request to proxy');
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
  }

  const cacheKey = body.method + JSON.stringify(body.params || []);
  if (body.method === 'getGossipNodes') {
    const cached = getCache(cacheKey);
    if (cached) return res.json({ ok: true, host: 'cache', data: cached });
  }

  const perHostErrors = [];
  let lastErr = null;
  for (const host of HOSTS) {
    try {
      const url = host;
      const r = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }, TIMEOUT_MS);

      if (!r.ok) {
        const err = new Error(`Host ${host} returned ${r.status}`);
        perHostErrors.push({ host, error: err.message });
        lastErr = err;
        continue;
      }

      const json = await r.json();

      // Cache getGossipNodes result
      if (body.method === 'getGossipNodes') {
        setCache(cacheKey, json, CACHE_TTL_MS);
      }

      console.log(`Successful upstream host: ${host}`);
      return res.json({ ok: true, host, data: json });
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      perHostErrors.push({ host, error: msg });
      lastErr = err;
      console.warn(`pRPC host ${host} failed: ${msg}`);
      continue;
    }
  }

  console.error('All pRPC hosts failed', lastErr && (lastErr.message || String(lastErr)));
  res.status(503).json({ ok: false, error: 'All pRPC hosts failed', lastError: lastErr && (lastErr.message || String(lastErr)), details: perHostErrors });
});

// Also support GET for quick checks: /?method=getGossipNodes
app.get('/', async (req, res) => {
  const method = req.query.method || 'getGossipNodes';
  const params = req.query.params ? JSON.parse(req.query.params) : [];
  const body = { jsonrpc: '2.0', id: 'proxy', method, params };
  req.body = body;
  return app._router.handle(req, res, () => {});
});

const PORT = Number(process.env.PORT || 80);
app.listen(PORT, () => console.log(`pRPC proxy listening on port ${PORT}, HOSTS=${HOSTS.length}`));
