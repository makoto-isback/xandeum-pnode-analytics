/**
 * API Route: /api/prpc
 * Server-side proxy for pRPC requests with automatic failover
 * 
 * Usage: /api/prpc?method=getGossipNodes
 * 
 * This endpoint:
 * - Forwards JSON-RPC requests to Xandeum pRPC nodes
 * - Automatically tries next host on failure (failover)
 * - Keeps pRPC IP addresses server-side only (security)
 * - Caches for 60s to reduce node load
 */

import { NextResponse } from "next/server";
import { getPRPCHosts } from "@/lib/prpcHosts";

const PRPC_PROXY_URL = process.env.PRPC_PROXY_URL || process.env.NEXT_PUBLIC_PRPC_ENDPOINT || '';
const PROXY_API_KEY = process.env.PROXY_API_KEY ?? '';
const isDebug = process.env.DEBUG_PRPC === '1' || process.env.NODE_ENV === 'development';

async function validateProxy(proxyUrl: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${proxyUrl.replace(/\/$/, '')}/health`, {
      method: 'GET',
      headers: { 'x-api-key': PROXY_API_KEY },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return { ok: true, status: res.status, body: await res.text().catch(() => null) };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const method = searchParams.get("method") || "getGossipNodes";
  const params = searchParams.get("params") ? JSON.parse(searchParams.get("params")!) : [];

  const body = {
    jsonrpc: "2.0",
    id: "xandeum-dashboard",
    method,
    params,
  };

  // If a proxy URL is configured, forward the JSON-RPC body to that proxy
  if (PRPC_PROXY_URL) {
    if (isDebug) console.log('[prpc] Start request', { method, proxyUrl: PRPC_PROXY_URL });
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Always send x-api-key header (may be empty)
      const headers: Record<string,string> = { 'Content-Type': 'application/json', 'x-api-key': PROXY_API_KEY };

      if (isDebug) console.log('[prpc] Calling proxy', PRPC_PROXY_URL, 'headers x-api-key length', String(headers['x-api-key']?.length));

      const response = await fetch(PRPC_PROXY_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const status = response.status;
      const json = await response.json().catch(() => null);

      if (isDebug) console.log('[prpc] Proxy response', { status, json });

      if (!response.ok) {
        if (isDebug) console.error('[prpc] Proxy returned non-OK', status, json);
        return NextResponse.json({ ok: false, error: 'Proxy error', status, detail: json, proxyUrl: PRPC_PROXY_URL }, { status: 502 });
      }

      // Expected proxy shape: { ok: true, host, data }
      return NextResponse.json(
        { ok: true, proxy: PRPC_PROXY_URL, host: json?.host || null, data: json?.data ?? json, proxyStatusCode: status },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
      );
    } catch (err: any) {
      const e = err instanceof Error ? err : new Error(String(err));
      if (isDebug) console.error('[prpc] Failed to contact PRPC proxy:', e.message);
      return NextResponse.json({ ok: false, error: 'Failed to contact PRPC proxy', detail: e.message, proxyUrl: PRPC_PROXY_URL }, { status: 502 });
    }
  }

  // Fallback: try direct hosts (legacy behaviour)
  const PRPC_HOSTS = getPRPCHosts();

  let lastError: Error | null = null;
  let lastHost: string = "";

  for (const host of PRPC_HOSTS) {
    try {
      lastHost = host;
      
      // Use AbortController for timeout
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
        
        // Success - return with cache headers
        return NextResponse.json(
          { ok: true, host, data: json },
          {
            headers: {
              "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
            },
          }
        );
      }
    } catch (err) {
      // Log but continue to next host
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`pRPC host ${host} failed: ${lastError.message}`);
      continue;
    }
  }

  // All hosts failed
  console.error(
    `All pRPC hosts failed. Last host: ${lastHost}, Error: ${lastError?.message}`
  );

  return NextResponse.json(
    {
      ok: false,
      error: "All pRPC hosts failed",
      lastHost,
      lastError: lastError?.message,
    },
    { status: 503 } // Service Unavailable
  );
}

export async function POST(req: Request) {
  // Also support POST for JSON-RPC style requests
  try {
    const body = await req.json();

    if (PRPC_PROXY_URL) {
      if (isDebug) console.log('[prpc:POST] Start', { proxyUrl: PRPC_PROXY_URL });
      try {
        const headers: Record<string,string> = { 'Content-Type': 'application/json', 'x-api-key': PROXY_API_KEY };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(PRPC_PROXY_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const status = response.status;
        const json = await response.json().catch(() => null);

        if (isDebug) console.log('[prpc:POST] Proxy response', { status, json });

        if (!response.ok) {
          return NextResponse.json({ ok: false, error: 'Proxy error', status, detail: json, proxyUrl: PRPC_PROXY_URL }, { status: 502 });
        }

        return NextResponse.json({ ok: true, proxy: PRPC_PROXY_URL, host: json?.host || null, data: json?.data ?? json, proxyStatusCode: status }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } });
      } catch (err: any) {
        const e = err instanceof Error ? err : new Error(String(err));
        if (isDebug) console.error('[prpc:POST] Failed to contact PRPC proxy:', e.message);
        return NextResponse.json({ ok: false, error: 'Failed to contact PRPC proxy', detail: e.message, proxyUrl: PRPC_PROXY_URL }, { status: 502 });
      }
    }

    // Fallback: direct hosts
    const PRPC_HOSTS = getPRPCHosts();

    let lastError: Error | null = null;
    let lastHost: string = "";

    for (const host of PRPC_HOSTS) {
      try {
        lastHost = host;
        
        // Use AbortController for timeout
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

          return NextResponse.json(
            { ok: true, host, data: json },
            {
              headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
              },
            }
          );
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`pRPC host ${host} failed: ${lastError.message}`);
        continue;
      }
    }

    console.error(
      `All pRPC hosts failed. Last host: ${lastHost}, Error: ${lastError?.message}`
    );

    return NextResponse.json(
      {
        ok: false,
        error: "All pRPC hosts failed",
        lastHost,
        lastError: lastError?.message,
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("pRPC proxy error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid request body",
      },
      { status: 400 }
    );
  }
}
