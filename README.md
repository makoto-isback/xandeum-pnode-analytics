# Xandeum pNode Analytics Dashboard

A fully featured, production-ready analytics platform for monitoring **Xandeum pNodes**, built with:

- Next.js 14 (App Router)
- TailwindCSS
- JSON-RPC pRPC integration
- Automatic failover across public pRPC hosts
- Secure server-side proxy for all blockchain calls
- Real-time network KPI analytics

This platform retrieves live pNode gossip data from Xandeum’s pRPC network and displays:

- Node pubkeys
- Gossip addresses
- Version & feature sets
- Latency
- Uptime (if provided)
- Last seen timestamp
- Online/offline status

---

## ✨ Features

### 🛠 Core Functionality
- Real pRPC integration (no mock data in production)
- Gossip discovery via `getGossipNodes`
- Automatic failover between 9+ public pRPC hosts
- 60s server-side caching for performance
- Fully normalized pNode data model

### 📊 Analytics & UI
- Total nodes count
- Online vs offline
- Average latency
- Real-time auto-refresh
- Search, filter, and sort functionality
- Node detail page (pubkey → view full metadata)

### 🚀 Production-Ready Architecture
- All RPC calls run server-side (secure)
- Environment variables overrideable
- Deployable to Vercel, Docker, or a VPS
- Modular and documented code structure

---

## 🧱 Project Structure

```
/app
  /dashboard
  /api/prpc
  /node/[pubkey]
/lib
  prpc.ts          # pRPC client + normalizer
  prpcHosts.ts     # host failover list
/components
  NodeTable.tsx
  KPIStats.tsx
  StatusBadge.tsx
.env.local
```

---

## 🔧 Environment Variables

```
NEXT_PUBLIC_PRPC_ENDPOINT=http://173.212.203.145:8899
```

If unset, system uses the built-in failover list.

---

## 🧪 Local Development

```
npm install
npm run dev
```

Visit  
👉 http://localhost:3000/dashboard

---

## 🛫 Production Deployment

### Deploy to Vercel
1. Push repo to GitHub
2. Import into Vercel
3. Add this env var:

```
NEXT_PUBLIC_PRPC_ENDPOINT=http://173.212.203.145:8899
```

4. Deploy

### Deploy via Docker
```
docker build -t xandeum-dashboard .
docker run -p 3000:3000 xandeum-dashboard
```

### Deploy on a VPS
```
npm install
npm run build
npm start
```

---

## 📄 License
MIT

📘 2. TECHNICAL DOCUMENTATION
# Technical Architecture — Xandeum pNode Analytics Dashboard

## 1. pRPC Connectivity Layer

All pRPC calls are routed through:
```
/app/api/prpc/route.ts
```

### Responsibilities:
- Server-side JSON-RPC client
- Round-robin host failover
- Timeout handling (5s per host)
- Response caching (60s)
- Sanitizes responses for frontend

---

## 2. pRPC Hosts
File:
```
/lib/prpcHosts.ts
```

Includes 9 public pRPC hosts:

- 173.212.203.145
- 173.212.220.65
- 161.97.97.41
- 192.190.136.36
- 192.190.136.37
- 192.190.136.38
- 192.190.136.28
- 192.190.136.29
- 207.244.255.1

---

## 3. pNode Normalization
File:  
```
/lib/prpc.ts
```

Functions:
- `normalizePNode(raw)`  
- `parseGossipResponse(response)`  
- `getGossipNodes()`  

Output format:

```
{
  pubkey: string
  gossip: string
  version: string
  latency: number
  uptime?: number
  lastSeen: number
  status: "online" | "offline"
}
```

---

## 4. Data Flow

Request →
API Proxy →
pRPC Host (failover) →
Normalization →
Caching →
Frontend Components →
UI Rendering


📘 3. DEPLOYMENT GUIDE
# Deployment Guide

## Deploy to Vercel

1. Push repo to GitHub
2. Login to vercel.com
3. Import project
4. Add environment variable:

```
NEXT_PUBLIC_PRPC_ENDPOINT=http://173.212.203.145:8899
```

5. Deploy 🚀

---

## Deploy with Docker

```
docker build -t xandeum-dashboard .
docker run -p 3000:3000 xandeum-dashboard
```

---

## Deploy to VPS (Ubuntu Example)

```
sudo apt update
sudo apt install nodejs npm -y
git clone <repo>
cd xandeum-dashboard
npm install
npm run build
npm start
```

## Deploying the Dockerized pRPC Proxy (Recommended for Production)

This repository includes a lightweight Dockerized pRPC proxy in `server-proxy/`. Run the proxy on a VPS with reliable egress so Vercel (or other serverless platforms) can reach pRPC hosts.

Quick options:

- Use the included deploy script on an Ubuntu/Debian VPS:

```bash
sudo bash deploy_proxy_vps.sh <your-vps-ip-or-domain>
# Example:
sudo bash deploy_proxy_vps.sh 203.0.113.12
```

- Or use `docker compose` directly inside `server-proxy/`:

```bash
cd server-proxy
docker compose build
docker compose up -d
```

The `server-proxy/docker-compose.yml` file exposes the proxy at port `8080` on the host and includes an optional `PROXY_API_KEY` env var for simple authentication.

### Systemd (the deploy script creates this automatically)

The deploy script creates a `systemd` service named `xandeum-prpc-proxy.service` which runs `docker compose up -d` on boot and provides `systemctl start|stop|status` control.

### Vercel Setup

In your Vercel project settings, set the environment variable:

```
NEXT_PUBLIC_PRPC_ENDPOINT=http://<your-vps-ip-or-domain>:8080
```

Then redeploy the frontend. The Next.js server code will forward all pRPC calls to the proxy.

### Optional API key

To require a simple header-based API key for proxy requests, set `PROXY_API_KEY` in the proxy host environment (or `server-proxy/docker-compose.yml`). Then set the same key in Vercel as an environment variable named `PROXY_API_KEY` so the Next.js server can include the header when calling `/api/prpc`.

Example header sent by the server when `PROXY_API_KEY` is set:

```
x-api-key: <your-key>
```

### Final Notes

- Do **not** expose upstream pRPC hosts to browsers — always route through the server-side proxy.
- If Vercel cannot reach the proxy, verify your VPS firewall and security groups allow port `8080` and that the proxy service is running.


📘 4. HACKATHON SUBMISSION WRITE-UP
# Xandeum pNode Analytics Platform — Submission

## 🎯 Problem
Xandeum needed a public-facing analytics platform to visualize pNode activity, gossip participation, uptime, and network health.

No public pNode dashboard existed.

---

## 🚀 Solution
We built a **full-featured analytics platform** powered by real pRPC calls with:

- Gossip discovery
- Online/offline detection
- Version tracking
- Latency calculation
- Node metadata display
- Network KPIs

---

## 🧠 Technical Highlights

### 🔹 JSON-RPC integration over pRPC  
Live pNode data is fetched from public pRPC hosts.

### 🔹 Secure API proxy  
Browser never touches IPs directly.

### 🔹 Automatic failover  
If one host fails, system retries the next.

### 🔹 Data normalization  
All pRPC formats converted to a unified schema.

### 🔹 Real-time dashboard  
Auto-refresh + search + filters + sort.

---

## 🛠 Technology

- Next.js 14
- TailwindCSS
- Server Actions
- Server-side caching
- JSON-RPC
- Node.js

---

## 📌 Submission Links
- Live Demo: <your_url_here>
- GitHub Repo: <repo_link_here>

---

## 📅 Next Improvements
- Historical metrics  
- Public uptime charts  
- Node performance scoring  
- Leaderboard system


📘 5. LANDING PAGE COPY (Marketing)
# pNode Analytics — The Xandeum Network Explorer

### Real-time insights for the world’s decentralized storage layer

Monitor Xandeum pNodes with:
- Live gossip discovery
- Real-time availability
- Latency monitoring
- Node version tracking
- Searchable pubkeys
- Intuitive analytics

Empowering developers and operators to keep the Xandeum network healthy and performant.

📘 6. EXTRA FEATURES — Included
✔ Auto-refresh
✔ Color-coded status badges
✔ Node Detail Page
✔ Version badges
✔ Latency categories (good/avg/bad)
✔ Online/offline chips
✔ Host monitoring logs (optional)

If you want the code for ANY of these add-ons, tell me:

“Give me the code for the extra features.”

# or
yarn install
# or
pnpm install
```

### Step 2: Environment Configuration

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your configuration:

```env
# pRPC API Endpoint
NEXT_PUBLIC_PRPC_ENDPOINT=https://api.xandeum.network

# Optional: For production, consider using authenticated endpoints
# NEXT_PUBLIC_PRPC_API_KEY=your_api_key_here
```

### Step 3: Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will start at `http://localhost:3000`

Visit `http://localhost:3000/dashboard` to access the main dashboard.

## 🏗 Project Structure

```
xandeum-pnode-analytics/
├── app/
│   ├── layout.tsx              # Root layout with header/footer
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard page
│   ├── node/
│   │   └── [pubkey]/
│   │       └── page.tsx        # Node detail page
│   └── api/
│       ├── nodes/
│       │   └── route.ts        # GET all nodes endpoint
│       └── node/
│           └── [pubkey]/
│               └── route.ts    # GET node detail endpoint
├── components/
│   ├── MetricsCards.tsx        # KPI cards component
│   ├── NodeTable.tsx           # Sortable nodes table
│   ├── NodeRow.tsx             # Table row component
│   ├── NodeDetailCard.tsx      # Node details display
│   └── ChartLatency.tsx        # Latency chart component
├── lib/
│   ├── types.ts                # TypeScript type definitions
│   ├── prpc.ts                 # pRPC client/API calls
│   └── utils.ts                # Utility functions
├── styles/
│   └── globals.css             # Global styles
├── public/                      # Static assets
├── package.json                # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # TailwindCSS config
├── postcss.config.js          # PostCSS config
├── .env.example               # Environment template
└── README.md                  # This file
```

## 📊 Data Model

Each pNode includes the following fields:

```typescript
interface pNode {
  pubkey: string;                    // Public key of the pNode
  gossip_address: string;            // Gossip protocol address
  version: string;                   // Software version
  latency: number;                   // Latency in milliseconds
  stake?: number;                    // Stake amount (if applicable)
  uptime?: number;                   // Uptime percentage
  storage_capacity?: number;         // Storage capacity
  online_status: 'online' | 'offline' | 'unknown';
  last_seen: string;                 // ISO timestamp
  features?: string[];               // Supported features
  location?: string;                 // Geographic location
  operator?: string;                 // Node operator info
  history?: LatencyData[];           // Historical latency data
  uptime_history?: UptimeData[];     // Historical uptime data
}
```

## 🔌 API Endpoints

### GET `/api/nodes`
Fetch all pNodes with metrics

**Response:**
```json
{
  "success": true,
  "data": {
    "nodes": [...],
    "metrics": {
      "total_nodes": 150,
      "online_nodes": 142,
      "offline_nodes": 8,
      "average_latency": 85,
      "highest_latency": 250,
      "lowest_latency": 15
    }
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### GET `/api/node/[pubkey]`
Fetch detailed information for a specific node

**Response:**
```json
{
  "success": true,
  "data": {
    "pubkey": "...",
    "gossip_address": "...",
    "version": "1.0.0",
    "latency": 85,
    "online_status": "online",
    "last_seen": "2025-01-15T10:30:00Z",
    "history": [...]
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## 🔄 Caching Strategy

- **Nodes list**: Cached for 60 seconds with 120-second stale-while-revalidate
- **Node detail**: Cached for 30 seconds with 60-second stale-while-revalidate
- **Frontend refresh**: Auto-refreshes every 30 seconds on dashboard

## 🔧 pRPC Integration

### Default Endpoints

The platform is configured to work with Xandeum's pRPC endpoints. Update `lib/prpc.ts` to use your preferred endpoints:

```typescript
const PRPC_ENDPOINT = process.env.NEXT_PUBLIC_PRPC_ENDPOINT || 'https://api.xandeum.network';
```

### Expected pRPC API Structure

The platform expects the following endpoints from pRPC:

- `GET /gossip/nodes` - Fetch all nodes in gossip network
- `GET /node/{pubkey}` - Fetch node details
- `GET /node/{pubkey}/health` - Health check endpoint
- `GET /health` - pRPC health endpoint

If your pRPC implementation uses different endpoint structures, modify the functions in `lib/prpc.ts`:

```typescript
export async function getGossipNodes(): Promise<pNode[]> {
  // Adapt the URL and response parsing to match your API
}
```

## 📱 Pages & Routes

### Dashboard (`/dashboard`)
- Main page with real-time metrics and node table
- Search, filter (status, version), and sorting functionality
- Auto-refresh every 30 seconds
- Manual refresh button

### Node Detail (`/node/[pubkey]`)
- Comprehensive node information
- Status indicator (online/offline)
- Performance metrics (latency, uptime, stake, storage)
- Latency history chart
- Uptime history chart
- Copy-to-clipboard for pubkey

### Root Redirect (`/`)
- Redirects to `/dashboard`

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/xandeum-pnode-analytics.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/import
   - Select your repository
   - Add environment variables:
     - `NEXT_PUBLIC_PRPC_ENDPOINT=https://api.xandeum.network`
   - Click "Deploy"

3. **Automatic Deployments**
   - Every push to `main` triggers a deployment

### Manual Deployment (Any Hosting)

```bash
npm run build
npm start
```

For production, consider using a process manager like PM2:

```bash
npm install -g pm2
pm2 start npm --name "pnode-analytics" -- start
pm2 startup
pm2 save
```

## 🧪 Development

### Run Development Server
```bash
npm run dev
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Build for Production
```bash
npm run build
npm start
```

## 📖 How pRPC Works

pRPC (pNode RPC) is Xandeum's JSON-RPC interface for interacting with the storage layer. It provides:

1. **Node Discovery**: Get list of all active pNodes via gossip protocol
2. **Node Info**: Query detailed metadata about individual pNodes
3. **Health Checks**: Verify node availability and latency
4. **Metrics**: Retrieve performance data (uptime, latency, etc.)

The platform uses pRPC to provide real-time visibility into the network's health and performance.

## 🔐 Security Notes

- All pRPC calls are made from the backend (Next.js API routes) to avoid CORS issues
- Sensitive information (like private keys) should never be exposed
- Use environment variables for API endpoints
- Consider implementing rate limiting for production use
- Validate all user inputs before using in queries

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📚 Resources

- [Xandeum Documentation](https://xandeum.network)
- [Xandeum Discord](https://discord.gg/uqRSmmM5m)
- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org)

## 📝 Environment Variables

### `.env.example`

```env
# pRPC Configuration
NEXT_PUBLIC_PRPC_ENDPOINT=https://api.xandeum.network

# Optional: Authentication
# NEXT_PUBLIC_PRPC_API_KEY=your_api_key_here

# Optional: Rate limiting
# NEXT_PUBLIC_REQUEST_TIMEOUT=30000

# Optional: Analytics
# NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## 🐛 Troubleshooting

### Nodes not loading?
1. Check that `NEXT_PUBLIC_PRPC_ENDPOINT` is set correctly
2. Verify the pRPC endpoint is accessible: `curl https://api.xandeum.network/health`
3. Check browser console for errors

### Build errors?
1. Ensure Node.js version is 18+: `node --version`
2. Clear cache: `rm -rf .next node_modules`
3. Reinstall dependencies: `npm install`

### Styling not applied?
1. Ensure TailwindCSS is properly configured
2. Run `npm run build` to verify the build
3. Check that `styles/globals.css` is imported in `app/layout.tsx`

## 📄 License

This project is open source and available under the MIT License.

## 🎯 Roadmap

### Current Version (MVP)
- ✅ Node discovery and listing
- ✅ Real-time metrics dashboard
- ✅ Node detail pages
- ✅ Search and filtering
- ✅ Basic charts

### Planned Features
- 📈 Advanced analytics with time-series data
- 🗺️ Geographic visualization
- 📧 Alert notifications
- 📊 Version distribution pie charts
- 🔔 Webhook notifications
- 📱 Mobile app
- 🌐 Multi-language support
- 💾 Historical data archival

## 🔄 Frontend Integration

**December 10, 2025**: Successfully integrated the complete frontend UI from the `xandeum-pnode-analytics` template. 

### What was integrated:
- ✅ Dashboard page with metrics cards, node table, search, and filtering
- ✅ Node detail page with metadata and latency charts
- ✅ Reusable components (MetricsCards, NodeTable, LatencyChart)
- ✅ Utility functions (cn, truncate, formatTimeAgo, etc.)
- ✅ Type definitions for both frontend and backend
- ✅ Dark mode and responsive design support

### Conversion Details:
- Converted from Vite + React Router to Next.js 14 App Router
- Integrated data transformation layer (backend pNode format → frontend PNode format)
- Merged TypeScript types from both projects
- Added clsx and tailwind-merge for className utilities

For full details, see [INTEGRATION_REPORT.md](./INTEGRATION_REPORT.md)

## 📞 Support

For issues, questions, or suggestions:
1. Check [GitHub Issues](https://github.com/yourusername/xandeum-pnode-analytics/issues)
2. Join [Xandeum Discord](https://discord.gg/uqRSmmM5m)
3. Email: support@xandeum.network

## 🙏 Acknowledgments

Built with inspiration from:
- [Stakewiz (Solana Validator Dashboard)](https://stakewiz.com)
- [Validators.app](https://validators.app)
- [Xandeum Community](https://discord.gg/uqRSmmM5m)

---

**Made with ❤️ for the Xandeum Network**

Last updated: January 2025
