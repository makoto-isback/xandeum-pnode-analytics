pRPC Proxy for Xandeum

This lightweight proxy forwards JSON-RPC requests to public Xandeum pRPC hosts with automatic failover and caching.

Usage

1. Build Docker image:

```bash
docker build -t xandeum-prpc-proxy ./server-proxy
```

2. Run (production):

```bash
docker run -p 80:80 \
  -e PRIMARY_PRPC="http://173.212.203.145:8899" \
  -e PRPC_TIMEOUT_MS=5000 \
  -e CACHE_TTL_MS=60000 \
  xandeum-prpc-proxy
```

3. Point your dashboard to the proxy (in Vercel env vars):

```
NEXT_PUBLIC_PRPC_ENDPOINT=http://<your-vps-ip>
```

Deployment on a VPS

- Use Docker as above or run with `node index.js` (install deps first).
- Ensure port 80/443 is open and reachable from Vercel.

Security

- Consider adding a simple IP allowlist or API key if you want to restrict access to the proxy.
- Use TLS (reverse proxy with nginx and Let's Encrypt) for production.
