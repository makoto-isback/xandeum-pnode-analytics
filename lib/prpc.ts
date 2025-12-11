/**
 * pRPC Client - Client-side only Cloudflare Worker proxy
 * 
 * This client:
 * - Fetches pRPC data directly from a Cloudflare Worker
 * - Worker URL configured via NEXT_PUBLIC_WORKER_URL
 * - Normalizes JSON-RPC responses to PNode format
 * - Provides typed interfaces for dashboard components
 */

import { pNode, NodeDetail, LatencyData } from './types';

/**
 * Get the Cloudflare Worker URL from environment
 */
function getWorkerUrl(): string {
  const url = process.env.NEXT_PUBLIC_WORKER_URL || '';
  if (!url) {
    console.error('NEXT_PUBLIC_WORKER_URL environment variable not set');
  }
  return url;
}

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
 * Fetch all gossip nodes from Cloudflare Worker
 * Client-side only. Worker handles all upstream pRPC requests.
 */
export async function getGossipNodes(): Promise<pNode[]> {
  const workerUrl = getWorkerUrl();
  if (!workerUrl) {
    console.error('Cannot fetch gossip nodes: NEXT_PUBLIC_WORKER_URL not configured');
    return [];
  }

  try {
    const response = await fetch(`${workerUrl}?method=getGossipNodes`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.error('getGossipNodes failed:', response.statusText, response.status);
      return [];
    }

    const json = await response.json();
    return parseGossipResponse(json);
  } catch (error) {
    console.error('Error fetching gossip nodes:', error);
    return [];
  }
}

/**
 * Fetch information for a specific node from Cloudflare Worker
 */
export async function getNodeInfo(pubkey: string): Promise<NodeDetail | null> {
  const workerUrl = getWorkerUrl();
  if (!workerUrl) {
    console.error('Cannot fetch node info: NEXT_PUBLIC_WORKER_URL not configured');
    return null;
  }

  try {
    const response = await fetch(`${workerUrl}?method=getNodeInfo&params=${JSON.stringify([pubkey])}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.error(`getNodeInfo failed for ${pubkey}:`, response.statusText);
      return null;
    }

    const json = await response.json();
    const nodeData = json?.result;
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
 * Format node detail data
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
 * Health check for pRPC Worker endpoint
 */
export async function checkPRPCHealth(): Promise<{ healthy: boolean; latency: number }> {
  const workerUrl = getWorkerUrl();
  if (!workerUrl) {
    return { healthy: false, latency: -1 };
  }

  const startTime = Date.now();

  try {
    const response = await fetch(`${workerUrl}?method=getGossipNodes`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    const latency = Date.now() - startTime;
    const healthy = response.ok;

    return { healthy, latency };
  } catch (error) {
    console.error('pRPC health check failed:', error);
    return { healthy: false, latency: -1 };
  }
}
