/**
 * Utility functions for the Xandeum pNode Analytics Platform
 */

import { pNode, NodeMetrics, LatencyData } from './types';

/**
 * Calculate metrics from a list of nodes
 */
export function calculateMetrics(nodes: pNode[]): NodeMetrics {
  if (nodes.length === 0) {
    return {
      total_nodes: 0,
      online_nodes: 0,
      offline_nodes: 0,
      average_latency: 0,
      highest_latency: 0,
      lowest_latency: 0,
    };
  }

  const onlineNodes = nodes.filter((n) => n.online_status === 'online');
  const validLatencies = onlineNodes.map((n) => n.latency).filter((l) => l > 0);

  const averageLatency =
    validLatencies.length > 0
      ? validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length
      : 0;

  return {
    total_nodes: nodes.length,
    online_nodes: onlineNodes.length,
    offline_nodes: nodes.length - onlineNodes.length,
    average_latency: Math.round(averageLatency),
    highest_latency: Math.max(...validLatencies, 0),
    lowest_latency: validLatencies.length > 0 ? Math.min(...validLatencies) : 0,
  };
}

/**
 * Filter nodes by search query
 */
export function searchNodes(nodes: pNode[], query: string): pNode[] {
  if (!query.trim()) return nodes;

  const lowerQuery = query.toLowerCase();

  return nodes.filter(
    (node) =>
      node.pubkey.toLowerCase().includes(lowerQuery) ||
      node.gossip_address.toLowerCase().includes(lowerQuery) ||
      node.version.toLowerCase().includes(lowerQuery) ||
      (node.operator && node.operator.toLowerCase().includes(lowerQuery)) ||
      (node.location && node.location.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Filter nodes by status
 */
export function filterByStatus(
  nodes: pNode[],
  status: 'all' | 'online' | 'offline'
): pNode[] {
  if (status === 'all') return nodes;
  return nodes.filter((node) => node.online_status === status);
}

/**
 * Filter nodes by version
 */
export function filterByVersion(nodes: pNode[], version: string): pNode[] {
  if (!version) return nodes;
  return nodes.filter((node) => node.version === version);
}

/**
 * Get unique versions from nodes
 */
export function getUniqueVersions(nodes: pNode[]): string[] {
  const versions = new Set(nodes.map((n) => n.version));
  return Array.from(versions).sort();
}

/**
 * Sort nodes by specified column
 */
export function sortNodes(
  nodes: pNode[],
  sortBy: keyof pNode,
  direction: 'asc' | 'desc' = 'asc'
): pNode[] {
  const sorted = [...nodes].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();

    if (direction === 'asc') {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });

  return sorted;
}

/**
 * Format latency for display
 */
export function formatLatency(latency: number): string {
  if (latency < 0) return 'N/A';
  if (latency < 1000) return `${latency.toFixed(0)}ms`;
  return `${(latency / 1000).toFixed(2)}s`;
}

/**
 * Determine status color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'online':
      return 'bg-green-100 text-green-800';
    case 'offline':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Determine latency severity color
 */
export function getLatencyColor(latency: number): string {
  if (latency < 0) return 'text-gray-400';
  if (latency < 100) return 'text-green-600';
  if (latency < 200) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch {
    return timestamp;
  }
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number | undefined): string {
  if (num === undefined) return 'N/A';
  return num.toLocaleString();
}

/**
 * Get status badge text
 */
export function getStatusBadge(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Truncate public key for display
 */
export function truncatePubkey(pubkey: string, chars: number = 8): string {
  if (pubkey.length <= chars * 2) return pubkey;
  return `${pubkey.slice(0, chars)}...${pubkey.slice(-chars)}`;
}

// ============================================================================
// FRONTEND UTILITIES (from downloaded component)
// ============================================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge className utilities with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Format time ago from ISO string
 */
export function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';
  return Math.floor(seconds) + 's ago';
}

/**
 * Generate mock latency history for fallback display
 */
export const generateMockHistory = (baseLatency: number): Array<{ timestamp: string; latency: number }> => {
  const history = [];
  const now = new Date();
  for (let i = 20; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    const variance = (Math.random() - 0.5) * 20;
    history.push({
      timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      latency: Math.max(5, Math.floor(baseLatency + variance)),
    });
  }
  return history;
};
