# API Documentation

## Overview

The Xandeum pNode Analytics Platform provides two main API endpoints that fetch and format data from your pRPC server. All endpoints are served from the same domain and support caching.

## Base URL

```
https://your-domain.com/api
```

## Endpoints

### 1. GET `/api/nodes`

Fetch all pNodes with aggregated metrics.

#### Request
```bash
curl https://your-domain.com/api/nodes
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "pubkey": "5D9qTfqnvZAKtgZkz3BQtUKuX2jVwqbLXvKKoSbpVqVx",
        "gossip_address": "192.0.2.1:8001",
        "version": "1.0.0",
        "latency": 85,
        "stake": 1000000,
        "uptime": 99.5,
        "storage_capacity": 1099511627776,
        "online_status": "online",
        "last_seen": "2025-01-15T10:30:00Z",
        "features": ["storage", "compute"],
        "operator": "MyOperator",
        "location": "US-West"
      }
      // ... more nodes
    ],
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

#### Parameters
None (query parameters not supported currently)

#### Caching
- Cache-Control: `public, s-maxage=60, stale-while-revalidate=120`
- Browser cache: 60 seconds
- Stale while revalidate: 120 seconds

#### Rate Limits
- No specific rate limits (depends on Vercel/hosting provider)

---

### 2. GET `/api/node/[pubkey]`

Fetch detailed information for a specific pNode.

#### Request
```bash
curl https://your-domain.com/api/node/5D9qTfqnvZAKtgZkz3BQtUKuX2jVwqbLXvKKoSbpVqVx
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "pubkey": "5D9qTfqnvZAKtgZkz3BQtUKuX2jVwqbLXvKKoSbpVqVx",
    "gossip_address": "192.0.2.1:8001",
    "version": "1.0.0",
    "latency": 85,
    "stake": 1000000,
    "uptime": 99.5,
    "storage_capacity": 1099511627776,
    "online_status": "online",
    "last_seen": "2025-01-15T10:30:00Z",
    "features": ["storage", "compute"],
    "operator": "MyOperator",
    "location": "US-West",
    "history": [
      {
        "timestamp": "2025-01-15T10:15:00Z",
        "latency": 82
      },
      {
        "timestamp": "2025-01-15T10:20:00Z",
        "latency": 87
      },
      {
        "timestamp": "2025-01-15T10:25:00Z",
        "latency": 85
      },
      {
        "timestamp": "2025-01-15T10:30:00Z",
        "latency": 85
      }
    ],
    "uptime_history": [
      {
        "timestamp": "2025-01-15T10:15:00Z",
        "uptime": 99.4
      },
      {
        "timestamp": "2025-01-15T10:20:00Z",
        "uptime": 99.5
      }
    ]
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pubkey | string (path) | Yes | Public key of the pNode |

#### Examples

```bash
# Get node details
curl https://your-domain.com/api/node/5D9qTfqnvZAKtgZkz3BQtUKuX2jVwqbLXvKKoSbpVqVx

# With authentication (if required)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-domain.com/api/node/5D9qTfqnvZAKtgZkz3BQtUKuX2jVwqbLXvKKoSbpVqVx
```

#### Caching
- Cache-Control: `public, s-maxage=30, stale-while-revalidate=60`
- Browser cache: 30 seconds
- Stale while revalidate: 60 seconds

#### Error Responses

**404 Not Found** - Node not found
```json
{
  "success": false,
  "error": "Node not found: invalid-pubkey",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**400 Bad Request** - Missing pubkey parameter
```json
{
  "success": false,
  "error": "pubkey parameter is required",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**500 Server Error** - Internal error
```json
{
  "success": false,
  "error": "Failed to fetch node details",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## Data Types

### pNode Object
```typescript
interface pNode {
  pubkey: string;
  gossip_address: string;
  version: string;
  latency: number;
  stake?: number;
  uptime?: number;
  storage_capacity?: number;
  online_status: 'online' | 'offline' | 'unknown';
  last_seen: string;
  features?: string[];
  location?: string;
  operator?: string;
}
```

### NodeMetrics Object
```typescript
interface NodeMetrics {
  total_nodes: number;
  online_nodes: number;
  offline_nodes: number;
  average_latency: number;
  highest_latency: number;
  lowest_latency: number;
}
```

### LatencyData Object
```typescript
interface LatencyData {
  timestamp: string;  // ISO 8601 timestamp
  latency: number;    // milliseconds
}
```

### APIResponse Wrapper
All API responses follow this format:
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;  // ISO 8601 timestamp
}
```

---

## Status Codes

| Code | Meaning | Notes |
|------|---------|-------|
| 200 | OK | Request succeeded |
| 400 | Bad Request | Missing or invalid parameters |
| 404 | Not Found | Node not found |
| 500 | Server Error | Internal server error |

---

## Rate Limiting

### Current Limits
- **Vercel Free**: ~100,000 requests/month
- **Vercel Pro**: Unlimited
- **Self-hosted**: Depends on server capacity

### Recommendations
- Cache responses on client side
- Use auto-refresh sparingly (current: 30 seconds)
- Implement request debouncing for search/filters
- Use ETag headers for conditional requests (if implemented)

---

## Example Usage

### JavaScript/TypeScript

```typescript
// Fetch all nodes
async function getAllNodes() {
  const response = await fetch('/api/nodes');
  const data = await response.json();
  
  if (data.success) {
    return data.data.nodes;
  }
  throw new Error(data.error);
}

// Fetch single node
async function getNode(pubkey: string) {
  const response = await fetch(`/api/node/${pubkey}`);
  const data = await response.json();
  
  if (data.success) {
    return data.data;
  }
  throw new Error(data.error);
}

// With error handling
try {
  const nodes = await getAllNodes();
  console.log(`Found ${nodes.length} nodes`);
} catch (error) {
  console.error('Failed to fetch nodes:', error);
}
```

### cURL Examples

```bash
# Get all nodes with pretty JSON
curl https://your-domain.com/api/nodes | jq

# Get specific node
curl https://your-domain.com/api/node/5D9qTfqnvZAKtgZkz3BQtUKuX2jVwqbLXvKKoSbpVqVx | jq

# Save to file
curl https://your-domain.com/api/nodes > nodes.json

# Get with authentication
curl -H "Authorization: Bearer $TOKEN" https://your-domain.com/api/nodes | jq
```

### Python Example

```python
import requests
import json

def get_nodes():
    response = requests.get('https://your-domain.com/api/nodes')
    data = response.json()
    
    if data['success']:
        return data['data']['nodes']
    else:
        raise Exception(data['error'])

def get_node(pubkey):
    response = requests.get(f'https://your-domain.com/api/node/{pubkey}')
    data = response.json()
    
    if data['success']:
        return data['data']
    else:
        raise Exception(data['error'])

# Usage
nodes = get_nodes()
print(f"Total nodes: {len(nodes)}")

# Get details for first node
if nodes:
    details = get_node(nodes[0]['pubkey'])
    print(f"Node latency: {details['latency']}ms")
```

---

## CORS & Authentication

### CORS Headers
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
Access-Control-Allow-Headers: Content-Type
```

### Authentication
Currently, all endpoints are public. To add authentication:

1. Add API key verification in `app/api/*/route.ts`
2. Check `Authorization` header
3. Return 401 if invalid

Example:
```typescript
const apiKey = request.headers.get('authorization');
if (apiKey !== `Bearer ${process.env.API_KEY}`) {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}
```

---

## Performance Tips

1. **Cache responses** - Use browser caching or CDN
2. **Batch requests** - Fetch all nodes once instead of individually
3. **Pagination** - Consider implementing for large node lists
4. **Compress responses** - gzip is automatic with most servers
5. **Monitor latency** - Track API response times
6. **Use CDN** - Cloudflare, Vercel Edge, etc.

---

## Troubleshooting

### "Cannot reach API"
1. Check your domain is accessible
2. Verify `.env.local` has correct `NEXT_PUBLIC_PRPC_ENDPOINT`
3. Check pRPC endpoint is running: `curl $PRPC_ENDPOINT/health`

### "Empty nodes array"
1. Verify pRPC has nodes available
2. Check pRPC endpoint URL format
3. Check pRPC returns data in expected format
4. Modify `formatGossipNodesData()` in `lib/prpc.ts` if needed

### "High latency responses"
1. pRPC might be slow - profile the pRPC endpoint
2. Use caching more aggressively
3. Consider database for historical data
4. Scale to more servers

---

## Future Enhancements

- [ ] Pagination for large node lists
- [ ] Filtering parameters (status, version, etc.)
- [ ] Sorting parameters
- [ ] WebSocket for real-time updates
- [ ] GraphQL endpoint option
- [ ] Authentication & API keys
- [ ] Rate limiting per API key
- [ ] Historical data aggregation
- [ ] Export to CSV/JSON

---

## Support

- 📖 [Full Documentation](./README.md)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)
- 💬 [Xandeum Discord](https://discord.gg/uqRSmmM5m)
- 🐛 [Report Issues](https://github.com/yourusername/xandeum-pnode-analytics/issues)

---

**API Documentation v1.0** | Last Updated: January 2025
