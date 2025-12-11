#!/usr/bin/env bash
set -euo pipefail

# VPS deployment script for the Dockerized pRPC proxy
# Usage: sudo bash deploy_proxy_vps.sh [public-ip-or-domain]

REPO="https://github.com/makoto-isback/xandeum-pnode-analytics.git"
APP_DIR="/opt/xandeum-pnode-analytics"
BRANCH="main"
PUBLIC_ADDR="$1"

if [ -z "$PUBLIC_ADDR" ]; then
  echo "Usage: sudo $0 <public-ip-or-domain>"
  exit 1
fi

echo "Installing Docker and docker-compose plugin..."
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release

mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/$(. /etc/os-release && echo "$ID")/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$(. /etc/os-release && echo "$ID") \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

echo "Docker installed. Cloning repository..."
rm -rf "$APP_DIR"
git clone --depth 1 --branch "$BRANCH" "$REPO" "$APP_DIR"

cd "$APP_DIR/server-proxy"

echo "Building and starting the proxy with docker compose..."
docker compose build --no-cache
docker compose up -d

echo "Creating systemd service to manage the proxy..."
SERVICE_FILE="/etc/systemd/system/xandeum-prpc-proxy.service"
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=Xandeum pRPC Proxy (docker-compose)
After=network.target docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR/server-proxy
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=120

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now xandeum-prpc-proxy.service

echo "Configuring firewall: opening port 8080/tcp..."
if command -v ufw >/dev/null 2>&1; then
  ufw allow 8080/tcp
  ufw reload || true
else
  echo "ufw not installed — please open port 8080 on your host firewall/security group manually if necessary"
fi

PUBLIC_URL="http://$PUBLIC_ADDR:8080"
echo "Deployment complete. Proxy reachable at: $PUBLIC_URL"
echo "Set Vercel env var NEXT_PUBLIC_PRPC_ENDPOINT to: $PUBLIC_URL"
