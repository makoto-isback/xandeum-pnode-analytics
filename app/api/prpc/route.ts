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
