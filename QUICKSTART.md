# Quick Start Guide

Welcome to the Xandeum pNode Analytics Platform! This guide will get you up and running in minutes.

## 📋 Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

Verify installations:
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
git --version   # Any recent version
```

## 🚀 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
```

This installs all required packages (Next.js, React, TailwindCSS, Recharts, etc.)

### Step 2: Create Environment File
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your pRPC endpoint:
```env
NEXT_PUBLIC_PRPC_ENDPOINT=https://api.xandeum.network
```

### Step 3: Run Development Server
```bash
npm run dev
```

### Step 4: Open in Browser
Visit: **http://localhost:3000/dashboard**

You should see:
- ✅ pNode Dashboard with metrics
- ✅ Real-time node list
- ✅ Search and filter options
- ✅ Click any node for details

## 🎯 What You Get

### Pages
- **Dashboard** (`/dashboard`) - Overview with all nodes and metrics
- **Node Detail** (`/node/[pubkey]`) - Detailed view of a single node

### Features
- 📊 Real-time metrics (total nodes, online/offline, average latency)
- 🔍 Search nodes by pubkey, address, or operator
- 🔽 Filter by status (online/offline) or version
- ↕️ Sort table by any column
- 📈 Latency charts
- 📱 Mobile responsive design
- 🌙 Dark mode support

## 📝 Configuration

### pRPC Endpoint
Edit `NEXT_PUBLIC_PRPC_ENDPOINT` in `.env.local` to point to your pRPC server:

```env
# Development/Testing
NEXT_PUBLIC_PRPC_ENDPOINT=https://api.xandeum.network

# Local pRPC
NEXT_PUBLIC_PRPC_ENDPOINT=http://localhost:8899

# Production
NEXT_PUBLIC_PRPC_ENDPOINT=https://api.your-domain.com
```

### Auto-Refresh Interval
Dashboard auto-refreshes every 30 seconds. To change:

Edit `app/dashboard/page.tsx` line ~60:
```typescript
const interval = setInterval(fetchNodes, 30000);  // 30 seconds
```

## 🔄 Available Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production
npm run build        # Build for production
npm start            # Start production server
npm run type-check   # Type-check without building
npm run lint         # Run ESLint

# Troubleshooting
rm -rf .next         # Clear Next.js cache
npm install          # Reinstall dependencies
npm audit fix        # Fix security vulnerabilities
```

## 📂 Project Structure

```
app/
├── layout.tsx              # Root layout (header, footer)
├── page.tsx                # Home (redirects to dashboard)
├── dashboard/page.tsx      # Main dashboard
├── node/[pubkey]/page.tsx  # Node detail page
└── api/
    ├── nodes/route.ts      # GET /api/nodes
    └── node/[pubkey]/route.ts  # GET /api/node/[pubkey]

components/
├── MetricsCards.tsx        # KPI cards
├── NodeTable.tsx           # Sortable table
├── NodeRow.tsx             # Table row
├── NodeDetailCard.tsx      # Node info
└── ChartLatency.tsx        # Latency chart

lib/
├── types.ts                # TypeScript types
├── prpc.ts                 # pRPC API client
└── utils.ts                # Utility functions

styles/
└── globals.css             # Global styles
```

## 🐛 Common Issues & Solutions

### "Cannot find module '@/lib/types'"
**Solution**: Ensure all files in `/lib` and `/components` are created
```bash
ls -la lib/     # Should show types.ts, prpc.ts, utils.ts
ls -la components/  # Should show *.tsx files
```

### "ECONNREFUSED" or "pRPC not responding"
**Solution**: Check pRPC endpoint is accessible
```bash
curl https://api.xandeum.network/health
```

### Styling not working (no colors/layout)
**Solution**: Rebuild Tailwind CSS
```bash
rm -rf .next
npm run dev
```

### Port 3000 already in use
**Solution**: Use a different port
```bash
PORT=3001 npm run dev
```

## 🚀 Ready for Production?

### Before Deploying:
1. ✅ Test locally: `npm run build && npm start`
2. ✅ Check types: `npm run type-check`
3. ✅ Run linter: `npm run lint`
4. ✅ Update `.env.local` with production endpoint
5. ✅ Review `DEPLOYMENT.md` for hosting options

### One-Click Deployment (Vercel)
```bash
git push origin main
# Vercel automatically deploys!
```

See `DEPLOYMENT.md` for detailed deployment instructions.

## 📚 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Recharts Docs](https://recharts.org)
- [Xandeum Docs](https://xandeum.network)
- [Xandeum Discord](https://discord.gg/uqRSmmM5m)

## 🔒 Environment Variables

All available options:

```env
# Required
NEXT_PUBLIC_PRPC_ENDPOINT=https://api.xandeum.network

# Optional
NEXT_PUBLIC_REQUEST_TIMEOUT=30000
NEXT_PUBLIC_ANALYTICS_ID=
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

⚠️ **Important**: Variables prefixed with `NEXT_PUBLIC_` are visible in frontend code. Never put secrets there!

## 💡 Tips

1. **Local Development**: Use `npm run dev` for hot-reload during development
2. **Type Safety**: Run `npm run type-check` before committing
3. **Testing**: Open DevTools (F12) to debug issues
4. **Dark Mode**: Toggle in your OS settings (auto-applies to app)
5. **Mobile**: Open DevTools and toggle device toolbar to test responsive design

## 🎉 Next Steps

1. Customize the dashboard colors in `tailwind.config.ts`
2. Add your logo to the header in `app/layout.tsx`
3. Configure auto-refresh interval in `app/dashboard/page.tsx`
4. Deploy to Vercel or your own server (see `DEPLOYMENT.md`)
5. Share with your team!

## 📞 Need Help?

- 💬 [Xandeum Discord](https://discord.gg/uqRSmmM5m)
- 🐛 [GitHub Issues](https://github.com/yourusername/xandeum-pnode-analytics/issues)
- 📖 [Full README](./README.md)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)

---

**Happy monitoring! 📊**

For issues or questions, ask in the Xandeum Discord community.
