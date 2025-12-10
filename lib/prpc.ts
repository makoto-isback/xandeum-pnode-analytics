/**
 * pRPC Client - Handles all communication with Xandeum pRPC endpoints
 * 
 * This client:
 * - Calls the server-side proxy at /api/prpc (keeps IPs hidden from browser)
 * - Automatically handles failover through PRPC_HOSTS
 * - Normalizes JSON-RPC responses to PNode format
 * - Provides typed interfaces for dashboard components
 */

import { pNode, NodeDetail, LatencyData } from './types';
import { getPRPCHosts } from './prpcHosts';

/**
 * Normalize a pRPC gossip node to our PNode type
 */
export function normalizePNode(node: any): pNode {
  return {
    pubkey: node.pubkey || node.identity || node.id || '',
    gossip_address: node.gossip || node.gossip_address || node.address || '',
    version: node.version || '',
    last_seen: node.lastSeen || node.timestamp || node.last_seen || new Date().toISOString(),
    latency: node.latency || 0,
    stake: node.stake || 0,
    uptime: node.uptime || 0,
    storage_capacity: node.storage_capacity || 0,
    online_status: (node.online_status !== false && !!node.pubkey) ? 'online' : 'offline',
    features: node.features || [],
    location: node.location,
    operator: node.operator,
  };
}

/**
 * Parse a JSON-RPC response from getGossipNodes
 * 
 * Expected format from pRPC:
 * {
 *   "jsonrpc": "2.0",
 *   "result": [{pubkey, gossip, version, ...}, ...],
 *   "id": "..."
 * }
 */
export function parseGossipResponse(resp: any): pNode[] {
  if (!resp?.result) {
    console.warn('parseGossipResponse: no result in response', resp);
    return [];
  }

  if (!Array.isArray(resp.result)) {
    console.warn('parseGossipResponse: result is not an array', resp.result);
    return [];
  }

  return resp.result.map(normalizePNode);
}

/**
 * Fetch all gossip nodes from pRPC via server-side proxy
 * 
 * When called from server: directly calls the pRPC nodes
 * When called from client: calls /api/prpc endpoint
 */
export async function getGossipNodes(): Promise<pNode[]> {
  try {
    // On server side, directly fetch from pRPC hosts
    if (typeof window === 'undefined') {
      return await getGossipNodesServer();
    }

    // On client side, use the API proxy
    const response = await fetch('/api/prpc?method=getGossipNodes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('getGossipNodes failed:', response.statusText);
      return [];
    }

    const proxyResult = await response.json();

    if (!proxyResult.ok) {
      console.error('pRPC proxy error:', proxyResult.error);
      return [];
    }

    // proxyResult.data is the JSON-RPC response from pRPC
    return parseGossipResponse(proxyResult.data);
  } catch (error) {
    console.error('Error fetching gossip nodes:', error);
    return [];
  }
}

/**
 * Server-side direct fetch from pRPC hosts
 */
async function getGossipNodesServer(): Promise<pNode[]> {
  const PRPC_HOSTS = getPRPCHosts();

  const body = {
    jsonrpc: "2.0",
    id: "xandeum-dashboard",
    method: "getGossipNodes",
    params: [],
  };

  for (const host of PRPC_HOSTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(host, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        return parseGossipResponse(json);
      }
    } catch (err) {
      console.warn(`pRPC host ${host} failed: ${err}`);
      continue;
    }
  }

  console.error('All pRPC hosts failed');
  return [];
}

/**
 * Fetch information for a specific node
 */
export async function getNodeInfo(pubkey: string): Promise<NodeDetail | null> {
  try {
    const response = await fetch(`/api/prpc?method=getNodeInfo&params=${JSON.stringify([pubkey])}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`getNodeInfo failed for ${pubkey}:`, response.statusText);
      return null;
    }

    const proxyResult = await response.json();

    if (!proxyResult.ok) {
      console.error('pRPC proxy error:', proxyResult.error);
      return null;
    }

    const nodeData = proxyResult.data?.result;
    if (!nodeData) {
      console.warn(`No node info found for ${pubkey}`);
      return null;
    }

    return formatNodeDetailData(nodeData);
  } catch (error) {
    console.error('Error fetching node info:', error);
    return null;
  }
}

/**
 * Check latency to a specific node
 */
export async function getNodeLatency(pubkey: string): Promise<number> {
  const startTime = Date.now();

  try {
    const response = await fetch(`/api/prpc?method=checkNodeHealth&params=${JSON.stringify([pubkey])}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      return -1;
    }

    return latency;
  } catch (error) {
    console.error('Error checking node latency:', error);
    return -1;
  }
}

/**
 * Format node detail response
 */
function formatNodeDetailData(data: any): NodeDetail {
  return {
    pubkey: data.pubkey || data.id || '',
    gossip_address: data.gossip_address || data.address || '',
    version: data.version || 'unknown',
    latency: data.latency || 0,
    stake: data.stake || 0,
    uptime: data.uptime || 0,
    storage_capacity: data.storage_capacity || 0,
    online_status: data.online_status || 'unknown',
    last_seen: data.last_seen || new Date().toISOString(),
    features: data.features || [],
    operator: data.operator,
    location: data.location,
    history: data.history || [],
    uptime_history: data.uptime_history || [],
  };
}

/**
 * Health check for pRPC endpoint via proxy
 */
export async function checkPRPCHealth(): Promise<{ healthy: boolean; latency: number }> {
  const startTime = Date.now();

  try {
    const response = await fetch('/api/prpc?method=getHealth', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const latency = Date.now() - startTime;

    const proxyResult = await response.json();
    const healthy = proxyResult.ok && response.ok;

    return {
      healthy,
      latency,
    };
  } catch (error) {
    console.error('pRPC health check failed:', error);
    return {
      healthy: false,
      latency: -1,
    };
  }
}
