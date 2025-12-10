# Deployment Guide for Xandeum pNode Analytics Platform

## Quick Start

This guide covers deploying the Xandeum pNode Analytics Platform to production.

## Recommended: Vercel (Zero-Config)

Vercel is the recommended hosting platform for Next.js applications and requires minimal setup.

### Prerequisites
- GitHub account
- Vercel account (free tier available)

### Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Xandeum pNode Analytics Platform"
   git branch -M main
   git remote add origin https://github.com/yourusername/xandeum-pnode-analytics.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Paste your GitHub repository URL
   - Select "Next.js" as the framework
   - Click "Import"

3. **Configure Environment Variables**
   - In the Vercel dashboard, go to Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_PRPC_ENDPOINT = https://api.xandeum.network
     ```
   - Click "Save"

4. **Deploy**
   - Click "Deploy"
   - Wait for the deployment to complete (usually 2-5 minutes)
   - Your app is now live! 🎉

5. **Custom Domain (Optional)**
   - Go to Settings → Domains
   - Add your custom domain
   - Follow DNS setup instructions

### Automatic Deployments

Every push to your main branch will automatically deploy to production. Create a separate branch for development:

```bash
git checkout -b develop
# Make changes
git push origin develop
# Create PR, merge when ready
```

## Alternative: Self-Hosted (Linux/macOS)

### Prerequisites
- VPS or dedicated server (2GB+ RAM recommended)
- Ubuntu 20.04+ or equivalent
- Node.js 18+ and npm
- PM2 for process management
- Nginx for reverse proxy

### Setup Steps

1. **SSH into your server**
   ```bash
   ssh root@your-server-ip
   ```

2. **Install dependencies**
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js
   curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt install -y nodejs
   
   # Install PM2 globally
   npm install -g pm2
   
   # Install Nginx
   apt install -y nginx
   ```

3. **Clone your repository**
   ```bash
   cd /var/www
   git clone https://github.com/yourusername/xandeum-pnode-analytics.git
   cd xandeum-pnode-analytics
   ```

4. **Install dependencies and build**
   ```bash
   npm install
   npm run build
   ```

5. **Create .env.local**
   ```bash
   cat > .env.local << EOF
   NEXT_PUBLIC_PRPC_ENDPOINT=https://api.xandeum.network
   EOF
   ```

6. **Start with PM2**
   ```bash
   pm2 start npm --name "pnode-analytics" -- start
   pm2 startup
   pm2 save
   ```

7. **Configure Nginx**
   ```bash
   cat > /etc/nginx/sites-available/pnode-analytics << 'EOF'
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   EOF
   ```

8. **Enable site and restart Nginx**
   ```bash
   ln -s /etc/nginx/sites-available/pnode-analytics /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

9. **Setup SSL with Let's Encrypt (Recommended)**
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com
   ```

10. **Monitor and Manage**
    ```bash
    # View logs
    pm2 logs pnode-analytics
    
    # Monitor status
    pm2 monit
    
    # Restart
    pm2 restart pnode-analytics
    ```

## Alternative: Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Build and Run
```bash
docker build -t pnode-analytics .
docker run -p 3000:3000 -e NEXT_PUBLIC_PRPC_ENDPOINT=https://api.xandeum.network pnode-analytics
```

### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_PRPC_ENDPOINT=https://api.xandeum.network
    restart: unless-stopped
```

## Performance Optimization

### Caching Headers
The application includes optimal caching headers:
- Nodes list: 60s cache + 120s stale-while-revalidate
- Node detail: 30s cache + 60s stale-while-revalidate

### CDN Setup (Cloudflare)
1. Add domain to Cloudflare
2. Update nameservers
3. Enable caching in Cloudflare settings
4. Set cache rules for API routes

## Monitoring & Alerts

### Health Check
```bash
# Monitor endpoint availability
curl https://your-domain.com/api/nodes
```

### Uptime Monitoring Services
- [UptimeRobot](https://uptimerobot.com) (Free)
- [Pingdom](https://www.pingdom.com)
- [Datadog](https://www.datadoghq.com)

Monitor these endpoints:
- `https://your-domain.com/dashboard` (main app)
- `https://your-domain.com/api/nodes` (API health)

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### App Crashes
```bash
# Check logs
pm2 logs pnode-analytics
journalctl -u nginx
```

### High Memory Usage
- Check pRPC endpoint response times
- Implement response pagination
- Use Vercel's edge caching

## Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS/SSL certificate
- [ ] Configure CORS if needed
- [ ] Set security headers (done via next.config.js)
- [ ] Regular dependency updates: `npm audit fix`
- [ ] Monitor for vulnerabilities
- [ ] Setup backup strategy
- [ ] Implement rate limiting for API routes
- [ ] Use environment variables for sensitive data
- [ ] Enable authentication if pRPC requires it

## Maintenance

### Regular Updates
```bash
# Weekly: Check for updates
npm outdated

# When needed: Update dependencies
npm update
npm audit fix

# Test before deploying
npm run build
npm run type-check
```

### Backup Strategy
- Git repository serves as source control backup
- For self-hosted: Daily filesystem backups
- Database backup (if using database in future)

### Scaling
As usage grows:
1. Enable Vercel Edge Caching
2. Consider API endpoint caching layer
3. Implement database for historical data
4. Setup monitoring and alerts
5. Use CDN for static assets

## Cost Estimates

### Vercel
- Free tier: ~100k requests/month
- Pro: $20/month (unlimited)
- Enterprise: Custom pricing

### Self-Hosted (VPS)
- Small VPS: $5-20/month (DigitalOcean, Linode)
- Medium VPS: $20-50/month
- Load balanced: $50+/month

## Getting Help

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/learn/foundations/how-nextjs-works/deployment)
- [Xandeum Discord](https://discord.gg/uqRSmmM5m)
- [GitHub Issues](https://github.com/yourusername/xandeum-pnode-analytics/issues)

## Success Indicators

After deployment, verify:
- [ ] Dashboard loads at `https://your-domain.com/dashboard`
- [ ] Metrics cards display correctly
- [ ] Node table populates with data
- [ ] Clicking a node shows detail page
- [ ] Search and filters work
- [ ] Charts render (if latency history available)
- [ ] Responsive design works on mobile
- [ ] Dark mode works correctly
- [ ] Auto-refresh works (check network tab)
- [ ] No console errors in browser DevTools

---

**Deployment completed successfully! Your pNode Analytics Platform is now live.** 🚀
