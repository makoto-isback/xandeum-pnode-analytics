/**
 * List of public pRPC hosts for Xandeum network
 * Ordered by reliability and geographic distribution
 * Dashboard will try each one sequentially for failover
 */

// Fallback public hosts (used when env var is not set)
const PUBLIC_PRPC_HOSTS = [
  "http://173.212.203.145:8899",
  "http://173.212.220.65:8899",
  "http://161.97.97.41:8899",
  "http://192.190.136.36:8899",
  "http://192.190.136.37:8899",
  "http://192.190.136.38:8899",
  "http://192.190.136.28:8899",
  "http://192.190.136.29:8899",
  "http://207.244.255.1:8899",
];

/**
 * Get the list of pRPC hosts to try
 * Prioritizes env var, then falls back to public hosts
 */
export function getPRPCHosts(): string[] {
  const primaryHost = process.env.NEXT_PUBLIC_PRPC_ENDPOINT;
  
  if (primaryHost) {
    // If env var is set, try it first, then fall back to public hosts
    return [primaryHost, ...PUBLIC_PRPC_HOSTS];
  }
  
  // Otherwise use public hosts
  return PUBLIC_PRPC_HOSTS;
}

// Legacy export for backward compatibility
export const PRPC_HOSTS = getPRPCHosts();

export function getPrimaryHost(): string {
  return process.env.NEXT_PUBLIC_PRPC_ENDPOINT || PRPC_HOSTS[0];
}

