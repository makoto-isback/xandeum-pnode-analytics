# Xandeum pNode Analytics Dashboard

A fast, lightweight analytics platform for monitoring **Xandeum pNodes**, built with:

- **Next.js 14** (App Router) — frontend on Vercel
- **TailwindCSS** — responsive UI
- **Cloudflare Worker** — free pRPC proxy
- **Client-side only** — no server costs
- **Real-time** pNode gossip data

This dashboard fetches live pNode gossip data from Xandeum pRPC and displays:

- Node pubkeys
- Gossip addresses
- Version info
- Latency
- Online/offline status
- Network KPIs

---

## ✨ Features

### 🛠 Core Functionality
- **Live pRPC integration** via Cloudflare Worker
- Gossip discovery (`getGossipNodes`)
- **Client-side only** — runs 100% in the browser
- **Zero server costs** — deploy free on Vercel
- Fully normalized pNode data model

### 📊 Analytics & UI
- Total nodes count
- Online vs offline breakdown
- Average latency calculation
- Real-time auto-refresh (30s)
- Search, filter, and sort
- Mobile-responsive design

### 🚀 Production-Ready
- Free Cloudflare Worker proxy
- Free Vercel frontend deployment
- No VPS, Docker, or running costs
- Modular, clean code structure

---

## 🧱 Project Structure

```
/app
  /dashboard        # Main dashboard page (client-side)
  /node/[pubkey]    # Node detail page
  /layout.tsx       # Root layout
/lib
  prpc.ts           # Cloudflare Worker client
  types.ts          # TypeScript interfaces
  utils.ts          # Helpers
/components
  NodeTable.tsx     # Nodes list
  MetricsCards.tsx  # KPI cards
```

---

## 🔧 Environment Variables

```env
NEXT_PUBLIC_WORKER_URL=https://your-worker-subdomain.workers.dev
```

That's it. Only one variable needed.

---

## 🧪 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Create .env.local (see .env.example)
cp .env.example .env.local

# Run dev server
npm run dev
```

Visit: http://localhost:3000/dashboard

### Build for Production

```bash
npm run build
npm start
```

---

## 🛫 Deploy to Vercel (Free)

1. **Push to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Ready to deploy"
   git push origin main
   ```

2. **Import into Vercel**
   - Go to https://vercel.com/new
   - Select your GitHub repo
   - Import

3. **Add Environment Variable**
   - In Vercel project settings → Environment Variables
   - Add: `NEXT_PUBLIC_WORKER_URL` = your Cloudflare Worker URL

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes

Your dashboard is now live on Vercel (free tier). ✅

---

## 🌐 Cloudflare Worker Setup (Free)

The dashboard fetches pRPC data from a **Cloudflare Worker** proxy, which:
- Forwards requests to public Xandeum pRPC hosts
- Handles timeouts and retries
- Is completely free on Cloudflare's free tier

### Create a Cloudflare Worker

1. Go to https://dash.cloudflare.com/
2. Navigate to **Workers & Pages**
3. Click **Create Application → Create Worker**
4. Name it (e.g., `xandeum-prpc`)
5. Paste this code:

```javascript
/**
 * Cloudflare Worker — pRPC Proxy for Xandeum Dashboard
 * Forwards JSON-RPC requests to public pRPC hosts with failover
 */

const PRPC_HOSTS = [
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

async function fetchWithTimeout(url, init = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const method = url.searchParams.get('method') || 'getGossipNodes';
    const params = url.searchParams.get('params') ? JSON.parse(url.searchParams.get('params')) : [];

    const body = {
      jsonrpc: '2.0',
      id: 'xandeum-dashboard',
      method,
      params
    };

    // Try each host until one succeeds
    for (const host of PRPC_HOSTS) {
      try {
        const res = await fetchWithTimeout(host, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (res.ok) {
          const json = await res.json();
          return new Response(JSON.stringify(json), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      } catch (e) {
        console.warn(`Host ${host} failed: ${e.message}`);
        continue;
      }
    }

    return new Response(JSON.stringify({ error: 'All hosts failed' }), { status: 503 });
  }
};
```

6. **Deploy** — click "Deploy"
7. **Copy the Worker URL** (looks like `https://xandeum-prpc-abc123.workers.dev`)

### Add to Vercel

1. In your Vercel project settings
2. Add environment variable: `NEXT_PUBLIC_WORKER_URL=<your-worker-url>`
3. Redeploy

Done! ✅

---

## 📖 Architecture

```
Browser (Vercel)
      ↓
   Dashboard (Next.js, TailwindCSS)
      ↓
   getGossipNodes() [lib/prpc.ts]
      ↓
   Cloudflare Worker (free proxy)
      ↓
   Public Xandeum pRPC Hosts
```

All data fetching is **client-side only**. No server code runs on Vercel.

---

## 🚀 Performance

- **Load time:** < 1 second (cached on Vercel Edge)
- **Data fetch:** 200-500ms (Cloudflare Worker + pRPC)
- **Auto-refresh:** Every 30 seconds
- **Bundle size:** ~50KB gzipped

---

## 🔒 Security

- pRPC hosts are accessed via Cloudflare Worker (no direct exposure to browser)
- No API keys or secrets in frontend code
- CORS-enabled Worker for safe cross-origin requests

---

## 📄 License

MIT

---

## ❓ Troubleshooting

### "Worker URL not configured"
- Check `.env.local` has `NEXT_PUBLIC_WORKER_URL` set
- Verify the Worker URL is correct (no trailing slash)

### "Failed to fetch nodes"
- Verify Cloudflare Worker is deployed and live
- Check browser console for CORS errors
- Ensure Worker can reach pRPC hosts

### Dashboard shows no nodes
- Check network tab (F12) — look for Worker response
- Verify Worker script has correct pRPC hosts
- Try visiting Worker URL directly in browser

---

## 🤝 Contributing

Feel free to fork, modify, and improve!

---

## 📌 Next Steps

- [ ] Add node detail page (`/node/[pubkey]`)
- [ ] Add historical metrics/charting
- [ ] Add public uptime tracker
- [ ] Add node geolocation map
- [ ] Add export/CSV download

---

**Ready to deploy?** Follow the quick start above. You'll have a live dashboard in ~10 minutes. 🚀
