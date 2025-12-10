/**
 * Development Mock pRPC Server
 * 
 * This is for LOCAL TESTING ONLY when real pRPC nodes are unreachable
 * In production, the real pRPC hosts will be used
 * 
 * Run: node scripts/dev-prpc-mock.js
 * Then: NEXT_PUBLIC_PRPC_ENDPOINT=http://localhost:4000 npm run dev
 */

const http = require('http');

// Sample gossip nodes matching Xandeum pRPC format
const gossipNodes = [
  {
    pubkey: "11111111111111111111111111111111",
    gossip: "192.168.1.100:8001",
    version: "1.18.0",
    featureSet: 2147483647,
    tpu: "192.168.1.100:8003",
    tpu_quic: "192.168.1.100:8004",
    timestamp: Date.now(),
    latency: 45,
    uptime: 99.8,
  },
  {
    pubkey: "22222222222222222222222222222222",
    gossip: "192.168.1.101:8001",
    version: "1.18.0",
    featureSet: 2147483647,
    tpu: "192.168.1.101:8003",
    tpu_quic: "192.168.1.101:8004",
    timestamp: Date.now(),
    latency: 72,
    uptime: 98.5,
  },
  {
    pubkey: "33333333333333333333333333333333",
    gossip: "192.168.1.102:8001",
    version: "1.17.0",
    featureSet: 2147483647,
    tpu: "192.168.1.102:8003",
    tpu_quic: "192.168.1.102:8004",
    timestamp: Date.now() - 7200000, // 2 hours ago
    latency: 150,
    uptime: 95.2,
  },
  {
    pubkey: "44444444444444444444444444444444",
    gossip: "192.168.1.103:8001",
    version: "1.18.0",
    featureSet: 2147483647,
    tpu: "192.168.1.103:8003",
    tpu_quic: "192.168.1.103:8004",
    timestamp: Date.now(),
    latency: 58,
    uptime: 99.1,
  },
  {
    pubkey: "55555555555555555555555555555555",
    gossip: "192.168.1.104:8001",
    version: "1.18.0",
    featureSet: 2147483647,
    tpu: "192.168.1.104:8003",
    tpu_quic: "192.168.1.104:8004",
    timestamp: Date.now(),
    latency: 88,
    uptime: 97.6,
  },
];

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'POST') {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        const body = JSON.parse(data);
        
        if (body.method === 'getGossipNodes') {
          return res.end(JSON.stringify({
            jsonrpc: '2.0',
            result: gossipNodes,
            id: body.id,
          }));
        }
        
        return res.end(JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32601, message: 'Method not found' },
          id: body.id,
        }));
      } catch (e) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`\n✅ Dev Mock pRPC Server running at http://localhost:${PORT}`);
  console.log(`📋 Gossip nodes available: ${gossipNodes.length}`);
  console.log('\n🔧 To use with Next.js:');
  console.log('   1. Set in .env.local: NEXT_PUBLIC_PRPC_ENDPOINT=http://localhost:4000');
  console.log('   2. Run: npm run dev');
  console.log('\n⚠️  This is for DEVELOPMENT ONLY. Remove mock and use real pRPC hosts for production.\n');
});
