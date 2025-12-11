/**
 * API Route: /api/prpc
 * Server-side proxy for pRPC requests (VPS proxy mode only)
 * 
 * Usage: /api/prpc?method=getGossipNodes
 * 
 * This endpoint:
 * - Forwards JSON-RPC requests ONLY to the configured VPS proxy (PRPC_PROXY_URL)
 * - NO fallback to public pRPC hosts in production
 * - Requires PRPC_PROXY_URL environment variable to be set
 * - Keeps pRPC IP addresses server-side only (security)
 */

import { NextResponse } from "next/server";

const PRPC_PROXY_URL = process.env.PRPC_PROXY_URL || '';
const PROXY_API_KEY = process.env.PROXY_API_KEY ?? '';
const isDebug = process.env.DEBUG_PRPC === '1' || process.env.NODE_ENV === 'development';
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

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

  // In production (Vercel or NODE_ENV=production), REQUIRE the proxy URL
  if (isProduction && !PRPC_PROXY_URL) {
    if (isDebug) console.error('[prpc] Production mode: PRPC_PROXY_URL not configured');
    return NextResponse.json(
      {
        ok: false,
        error: 'Proxy URL not configured',
        proxyConfigError: 'PRPC_PROXY_URL environment variable is required in production',
        selectedProxyUrl: null,
      },
      { status: 400 }
    );
  }

  // If proxy URL is configured, use it
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
        return NextResponse.json(
          { ok: false, error: 'Proxy error', status, detail: json, selectedProxyUrl: PRPC_PROXY_URL },
          { status: 502 }
        );
      }

      // Expected proxy shape: { ok: true, host, data }
      return NextResponse.json(
        { ok: true, proxy: PRPC_PROXY_URL, host: json?.host || null, data: json?.data ?? json, proxyStatusCode: status, selectedProxyUrl: PRPC_PROXY_URL },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
      );
    } catch (err: any) {
      const e = err instanceof Error ? err : new Error(String(err));
      if (isDebug) console.error('[prpc] Failed to contact PRPC proxy:', e.message);
      return NextResponse.json(
        { ok: false, error: 'Failed to contact PRPC proxy', detail: e.message, selectedProxyUrl: PRPC_PROXY_URL },
        { status: 502 }
      );
    }
  }

  // No proxy configured and not in production: error
  if (isDebug) console.warn('[prpc] No proxy URL configured and not in production mode');
  return NextResponse.json(
    {
      ok: false,
      error: 'Proxy URL not configured',
      proxyConfigError: 'PRPC_PROXY_URL environment variable is not set',
      selectedProxyUrl: null,
    },
    { status: 400 }
  );
}

export async function POST(req: Request) {
  // Also support POST for JSON-RPC style requests
  try {
    const body = await req.json();

    // In production (Vercel or NODE_ENV=production), REQUIRE the proxy URL
    if (isProduction && !PRPC_PROXY_URL) {
      if (isDebug) console.error('[prpc:POST] Production mode: PRPC_PROXY_URL not configured');
      return NextResponse.json(
        {
          ok: false,
          error: 'Proxy URL not configured',
          proxyConfigError: 'PRPC_PROXY_URL environment variable is required in production',
          selectedProxyUrl: null,
        },
        { status: 400 }
      );
    }

    // If proxy URL is configured, use it
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
          return NextResponse.json(
            { ok: false, error: 'Proxy error', status, detail: json, selectedProxyUrl: PRPC_PROXY_URL },
            { status: 502 }
          );
        }

        return NextResponse.json(
          { ok: true, proxy: PRPC_PROXY_URL, host: json?.host || null, data: json?.data ?? json, proxyStatusCode: status, selectedProxyUrl: PRPC_PROXY_URL },
          { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
        );
      } catch (err: any) {
        const e = err instanceof Error ? err : new Error(String(err));
        if (isDebug) console.error('[prpc:POST] Failed to contact PRPC proxy:', e.message);
        return NextResponse.json(
          { ok: false, error: 'Failed to contact PRPC proxy', detail: e.message, selectedProxyUrl: PRPC_PROXY_URL },
          { status: 502 }
        );
      }
    }

    // No proxy configured: error
    if (isDebug) console.warn('[prpc:POST] No proxy URL configured');
    return NextResponse.json(
      {
        ok: false,
        error: 'Proxy URL not configured',
        proxyConfigError: 'PRPC_PROXY_URL environment variable is not set',
        selectedProxyUrl: null,
      },
      { status: 400 }
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
