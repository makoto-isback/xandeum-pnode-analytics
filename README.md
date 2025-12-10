# Xandeum pNode Analytics Platform

A modern, production-ready real-time analytics dashboard for Xandeum storage-layer providers (pNodes). Monitor node health, latency, uptime, and other critical metrics with an intuitive web interface.

**✨ Status**: Fully integrated frontend from xandeum-pnode-analytics UI template. All components, pages, and utilities merged and tested.

## 🚀 Overview

This platform provides a clean, modern dashboard similar to Solana validator dashboards (stakewiz.com, validators.app) but specifically designed for Xandeum's pRPC infrastructure. It enables storage providers and network operators to monitor their pNodes in real-time.

### Key Features

- **Real-Time Monitoring**: Live metrics for all pNodes in the gossip network
- **Node Discovery**: Automatically fetch and display all pNodes from pRPC
- **Advanced Filtering**: Search, filter by status (online/offline), and version
- **Detailed Analytics**: Per-node latency, uptime, and performance metrics
- **Interactive Charts**: Latency trends over time with Recharts visualization
- **Responsive Design**: Mobile-friendly interface with dark/light mode support
- **Production Ready**: Fully typed TypeScript, optimized API routes, caching strategies

## 📋 Tech Stack

### Frontend
- **Next.js 14** (App Router) - Modern React framework with integrated API routes
- **TypeScript 5.3** - Type-safe development
- **React 18.2** - UI library
- **TailwindCSS 3.4** - Utility-first CSS framework with dark mode
- **Recharts 2.10** - Interactive charts and visualizations
- **Lucide React 0.294** - Beautiful icon library
- **clsx & tailwind-merge** - Utility for className management

### Backend
- **Next.js API Routes** - Built-in serverless backend
- **TypeScript** - Type safety across the stack
- **Fetch API** - Communication with pRPC endpoints

### Deployment
- **Vercel** - Recommended hosting (zero-config deployment)
- **Edge Caching** - Built-in response caching for performance

## 🛠 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Git
- A text editor (VS Code recommended)

### Step 1: Install Dependencies

```bash
npm install
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
