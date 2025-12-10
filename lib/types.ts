/**
 * Xandeum pNode Analytics Platform - Type Definitions
 * Defines all data models for pNode information
 * Merged from both backend (Next.js) and frontend (Vite) types
 */

// Frontend type (from downloaded component)
export interface PNode {
  pubkey: string;
  gossip: string;
  version: string;
  latency: number;
  online: boolean;
  lastSeen: string;
  location?: string;
}

// Backend type (existing)
export interface pNode {
  pubkey: string;
  gossip_address: string;
  version: string;
  latency: number; // in milliseconds
  stake?: number; // optional stake amount
  uptime?: number; // percentage or value
  storage_capacity?: number;
  online_status: 'online' | 'offline' | 'unknown';
  last_seen: string; // ISO timestamp
  features?: string[];
  location?: string;
  operator?: string;
}

// Frontend metrics type
export interface FrontendNodeMetrics {
  total: number;
  online: number;
  offline: number;
  avgLatency: number;
}

// Backend metrics type
export interface NodeMetrics {
  total_nodes: number;
  online_nodes: number;
  offline_nodes: number;
  average_latency: number;
  highest_latency: number;
  lowest_latency: number;
}

export interface LatencyData {
  timestamp: string;
  latency: number;
}

export interface LatencyDataPoint {
  timestamp: string;
  latency: number;
}

export type SortField = 'pubkey' | 'version' | 'latency' | 'lastSeen' | 'online';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  status: 'all' | 'online' | 'offline';
  minVersion: string;
}

// API Response Wrappers
export interface GossipNodesResponse {
  nodes: PNode[];
}

export interface NodeDetail extends pNode {
  history?: LatencyData[];
  uptime_history?: Array<{
    timestamp: string;
    uptime: number;
  }>;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface NodesResponse extends APIResponse<{
  nodes: pNode[];
  metrics: NodeMetrics;
}> {}

export interface NodeDetailResponse extends APIResponse<NodeDetail> {}
export interface NodeDetail extends pNode {
  history?: LatencyData[];
  uptime_history?: Array<{
    timestamp: string;
    uptime: number;
  }>;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface NodesResponse extends APIResponse<{
  nodes: pNode[];
  metrics: NodeMetrics;
}> {}

export interface NodeDetailResponse extends APIResponse<NodeDetail> {}
